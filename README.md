merge-ldjson-streams
====================

Merge line delimited JSON readable streams (for instance coming from
CSV data) operating in object mode.


[![NPM](https://nodei.co/npm/merge-ldjson-streams.png)](https://nodei.co/npm/merge-ldjson-streams/)

Usage
=====

    var Mls = require('merge-ldjson-streams');

    var mergedStream = new Mls([ldjsonStream1, ldjsonStream2], options);
    mergedStream.on('data', function(mergedRow){
      console.log(mergedRow);
    });


Tests
=====

     npm test


License
=======

MIT
