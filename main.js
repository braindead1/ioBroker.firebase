'use strict';

/*
 * Created with @iobroker/create-adapter v1.26.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

const admin = require('firebase-admin');

class Firebase extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'firebase',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('unload', this.onUnload.bind(this));

        this.firebaseConfig = {};
        this.serviceAccount = {};
        this.db;

        this.historyCollection = '';
        this.firebaseDps = {};
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Reset the connection indicator during startup
        this.setState('info.connection', false, true);

        await this.initializeConfiguration();

        // Get history states
        await this.getObjectViewAsync('custom', 'state', {})
            .then((doc) => {
                if (doc && doc.rows) {
                    for (let i = 0, l = doc.rows.length; i < l; i++) {
                        if (doc.rows[i].value &&
                            doc.rows[i].value[this.namespace] &&
                            typeof doc.rows[i].value[this.namespace] === 'object' &&
                            doc.rows[i].value[this.namespace].enabled) {
                            const id = doc.rows[i].id;
                            const custom = doc.rows[i].value[this.namespace];

                            this.initDp(id, custom);
                            this.subscribeForeignStates(id);
                        }
                    }
                }
            });

        // Subscribe to object changes
        this.subscribeForeignObjects('*');

        // Connect to Firebase
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(JSON.stringify(this.serviceAccount)))
        });
        this.db = admin.firestore();

        // Set connection indicator to conneced
        this.setState('info.connection', true, true);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Cleanup adapter
            this.db.terminate();

            this.unsubscribeForeignObjects('*');
            this.unsubscribeForeignStates('*');

            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj && obj.common &&
            (obj.common.custom &&
                obj.common.custom[this.namespace] &&
                typeof obj.common.custom[this.namespace] === 'object' &&
                obj.common.custom[this.namespace].enabled)) {
            // The object was changed
            this.initDp(id, obj.common.custom[this.namespace]);
            this.subscribeForeignStates(id);
        } else {
            // The object was deleted
            delete this.firebaseDps[id];
            this.unsubscribeForeignStates(id);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (this.firebaseDps[id] !== undefined && state) {
            // The state was changed
            this.pushValueToFirebase(id, state);
        }
    }

    /**
     * Is called to read the adapter configuration
     */
    async initializeConfiguration() {
        try {
            this.firebaseConfig = JSON.parse(this.config.firebaseConfig);
            this.serviceAccount = JSON.parse(this.config.serviceAccount);
            this.historyCollection = this.config.historyCollection || 'history';
        } catch (e) {
            this.log.error(e);
        }
    }

    /**
     * Is called to update ioBroker objects and states
     * @param {string} collection
     * @param {Object} doc
     */
    async updateObject(collection, doc) {
        try {
            this.log.debug(JSON.stringify(collection));
            this.log.debug(JSON.stringify(doc));
        } catch (e) {
            this.log.error(e);
        }
    }

    /**
     * Is used to push state changes to Firebase
     * @param {string} id 
     * @param {ioBroker.State} state 
     */
    pushValueToFirebase(id, state) {
        if (typeof state.val === 'object') {
            state.val = JSON.stringify(state.val);
        }

        const data = {
            id: id,
            value: state.val,
            time: new Date(state.ts),
            from: state.from || '',
            q: state.q || 0,
            ack: !!state.ack
        };

        this.db.collection(this.historyCollection).add(data);
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {Object} custom
     */
    initDp(id, custom) {
        // changesOnly
        custom.changesOnly = custom.changesOnly === 'true' || custom.changesOnly === true;

        // debounce
        if (custom.debounce || custom.debounce === 0) {
            custom.debounce = parseInt(custom.debounce, 10) || 0;
        } else {
            custom.debounce = this.config.debounce;
        }

        this.firebaseDps[id] = custom;

        this.log.info(`enabled logging for ${id}`);
    }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Firebase(options);
} else {
    // otherwise start the instance directly
    new Firebase();
}