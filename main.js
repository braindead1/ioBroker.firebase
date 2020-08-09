'use strict';

/*
 * Created with @iobroker/create-adapter v1.26.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

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
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));

        this.firebaseDps = {};
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Reset the connection indicator during startup
        this.setState('info.connection', false, true);

        // Subscribe to changes
        this.subscribeForeignObjects('*');
        this.subscribeStates('*');

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
            this.initDp(id, obj);
        } else {
            // The object was deleted
            delete this.firebaseDps[id];
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.message" property to be set to true in io-package.json
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
        if (typeof obj === 'object' && obj.message) {
            this.log.debug(JSON.stringify(obj));

            /*if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');

                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
            }*/
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.Object} obj
     */
    initDp(id, obj) {
        // @ts-ignore
        const custom = obj.common.custom[this.namespace];

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