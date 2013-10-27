merge-ldjson-streams
====================

Merge line by line streams operating in object mode.


[![NPM](https://nodei.co/npm/merge-object-streams.png)](https://nodei.co/npm/merge-object-streams/)

Usage
=====

    var Mos = require('merge-object-streams');

    var mergedStream = new Mos([ldjsonStream1, ldjsonStream2], options);
    mergedStream.on('data', function(mergedRow){
      console.log(mergedRow);
    });


Tests
=====

     npm test


License
=======

MIT
