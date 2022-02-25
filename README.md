![Logo](admin/firebase.png)
# ioBroker.firebase

[![NPM version](http://img.shields.io/npm/v/iobroker.firebase.svg)](https://www.npmjs.com/package/iobroker.firebase)
[![Downloads](https://img.shields.io/npm/dm/iobroker.firebase.svg)](https://www.npmjs.com/package/iobroker.firebase)
![Number of Installations (latest)](http://iobroker.live/badges/firebase-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/firebase-stable.svg)
[![Dependency Status](https://img.shields.io/david/braindead1/iobroker.firebase.svg)](https://david-dm.org/braindead1/iobroker.firebase)
[![Known Vulnerabilities](https://snyk.io/test/github/braindead1/ioBroker.firebase/badge.svg)](https://snyk.io/test/github/braindead1/ioBroker.firebase)

[![NPM](https://nodei.co/npm/iobroker.firebase.png?downloads=true)](https://nodei.co/npm/iobroker.firebase/)

This adapter connects ioBroker to Google Firebase.

## Requirements
A working Firebase project is required to use this adapter.

1. Create a new project on https://firebase.google.com.
2. Create a Web App. The created JSON has to be copied into the adapter configuration. It is important to put the keys of the JSON into quotation marks.
3. Create a Cloud Firestore database.
4. Create a service account. The downloaded JSON has to be copied into the adapter configuration.

## Changelog

### 0.0.1
* (braindead1) initial release

## License
MIT License

Copyright (c) 2022 braindead1 <os.braindead1@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.