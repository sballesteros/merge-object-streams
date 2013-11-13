var Mos = require('..')
  , Readable = require('stream').Readable
  , PassThrough = require('stream').PassThrough
  , util = require("util")
  , assert = require('assert');

function StreamObj(objList, options){
  options = options || {};
  options.objectMode = true;

  Readable.call(this, options);
  this._objList = objList;
  this._i = 0;
  this._iEnd = objList.length;
};

util.inherits(StreamObj, Readable);

StreamObj.prototype._read = function (size){
  this.push(this._objList[this._i++]);
  if(this._i === this._iEnd){
    this.push(null);
  }
};



function makeStreams(datalist){
  var streams = [];

  datalist.forEach(function(data){
    var s = new StreamObj(data);    
    streams.push(s);
  });

  return streams;
};

describe('merge', function(){

  var data1 = [
    {a: 1, b: 2, c: 3},
    {a: 4, b: 5, c: 6},
    {a: 7, b: 8, c: 9},
    {a: 10, b: 11, c: 12},
    {a: 13, b: 14, c: 15},
    {a: 16, b: null, c: 18},
    {a: 19, b: 20, c: 21}
  ];

  var data2 = [
    {d: 1, e: 2, f: 3},
    {d: 4, e: 5, f: 6},
    {d: 7, e: 8, f: 9},
    {d: 10, e: 11, f: 12},
    {d: 13, e: 14, f: 15},
    {d: 16, e: null, f: 18},
    {d: 19, e: 20, f: 21}
  ];

  var data3 = [
    {f: 77, g: 78},
    {f: 79, g: 80},
    {f: 81, g: 82}
  ];

  var data4 = [
    {h: 1000}
  ];
    
  it('should merge streams of the same length', function(done){

    var expected = [
      { a: 1, b: 2, c: 3, d: 1, e: 2, f: 3 },
      { a: 4, b: 5, c: 6, d: 4, e: 5, f: 6 },
      { a: 7, b: 8, c: 9, d: 7, e: 8, f: 9 },
      { a: 10, b: 11, c: 12, d: 10, e: 11, f: 12 },
      { a: 13, b: 14, c: 15, d: 13, e: 14, f: 15 },
      { a: 16, b: null, c: 18, d: 16, e: null, f: 18 },
      { a: 19, b: 20, c: 21, d: 19, e: 20, f: 21 }
    ];

    assert.equal(data1.length, data2.length);
    var cnt = 0;

    var m = new Mos(makeStreams([data1, data2]));

    m.on('data', function(row){
      assert.deepEqual(row, expected[cnt++]);
    });

    m.on('end', done);
  });

  it('should merge streams of different length', function(done){

    var expected = [
      { a: 1, b: 2, c: 3, d: 1, e: 2, f: 77, g: 78, h: 1000 },
      { a: 4, b: 5, c: 6, d: 4, e: 5, f: 79, g: 80 },
      { a: 7, b: 8, c: 9, d: 7, e: 8, f: 81, g: 82 },
      { a: 10, b: 11, c: 12, d: 10, e: 11, f: 12 },
      { a: 13, b: 14, c: 15, d: 13, e: 14, f: 15 },
      { a: 16, b: null, c: 18, d: 16, e: null, f: 18 },
      { a: 19, b: 20, c: 21, d: 19, e: 20, f: 21 }
    ];

    var cnt = 0;

    var m = new Mos(makeStreams([data1, data2, data3, data4]));

    m.on('data', function(row){
      assert.deepEqual(row, expected[cnt++]);
    });

    m.on('end', done);
  });
});
