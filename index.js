var fs = require('fs')
  , path = require('path')
  , Readable = require('stream').Readable
  , util = require('util');

/**
 * Merge ldjson streams
 */
function MergeLdjsonStreams(sources, options) {
  options = options || {};
  options.objectMode = true;
  Readable.call(this, options);

  var that = this;

  this._sources = sources;  
  this._cnt = 0;
  this._nFlowing = sources.length; //number of stream from sources still flowing (i.e not having emitted "end"). This is usefull if the streams don't have the same number of rows
  this._cntEnd = 0;
  this._sync = false;
  this._tmps = new Array(sources.length);

  this._sources.forEach(function(s, i){   
    s.mergedId = i;

    s.on('data', function(obj){
      s.pause();
      that._cnt++;
      that._sync = false;
      that._tmps[s.mergedId] = obj;

      if(that._cnt == that._nFlowing){
        that.pushMerge();
      }
    });

    s.on('error', function(err){
      that.emit(err);
    });

    s.on('end', function(){
      that._cntEnd++;
      that._nFlowing--;
      that._tmps[s.mergedId] = {};

      if(that._nFlowing = that._cnt){
        that.pushMerge();
      }

      if(that._cntEnd == that._sources.length){
        that.push(null);
      }
    });

  });

};

util.inherits(MergeLdjsonStreams, Readable);

MergeLdjsonStreams.prototype._read = function() {
  if(this._sync){    
    this._sources.forEach(function(s){    
      s.resume();
    });
  }
};

MergeLdjsonStreams.prototype.pushMerge = function(){
  this._cnt = 0;

  var merged = {};
  this._tmps.forEach(function(ob){
    for(var key in ob){
      merged[key] = ob[key];
    }
  });

  this._sync = true;
  this.push(merged); 
};
