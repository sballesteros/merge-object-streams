var fs = require('fs')
  , path = require('path')
  , Readable = require('stream').Readable
  , util = require('util');

/**
 * Merge streams in objectMode
 */
function MergeObjectStreams(sources, options) {
  options = options || {};
  options.objectMode = true;
  Readable.call(this, options);

  var that = this;

  this._sources = sources;  
  this._cnt = 0;
  this._nFlowing = sources.length; //number of stream from sources still flowing (i.e not having emitted "end"). This is usefull if the streams don't have the same number of rows
  this._cntEnd = 0;
  this._sync = false;
  this._flowedIds = [];
  this._tmps = new Array(sources.length);

  this._sources.forEach(function(s, i){   
    s.mergedId = i;

    s.on('data', function(obj){

      s.pause();
      that._cnt++;
      that._sync = false;
      that._tmps[s.mergedId] = obj;
      that._flowedIds.push(s.mergedId);

      if(that._cnt >= that._nFlowing){
        that.pushMerge();
      }
    });

    s.on('error', function(err){
      that.emit(err);
    });

    s.on('end', function(){
      that._nFlowing--;
      that._cntEnd++;

      if( that._cnt && (that._flowedIds.indexOf(s.mergedId) === -1) && (that._cnt == that._nFlowing) ){
        that.pushMerge();
      }

      if(that._cntEnd === that._sources.length){
        if(that._cnt){
          that.pushMerge();
        }
        that.push(null);
      }
    });

  });

};

util.inherits(MergeObjectStreams, Readable);

MergeObjectStreams.prototype._read = function() {
  if(this._sync){    
    this._sources.forEach(function(s){    
      s.resume();
    });
  }
};

MergeObjectStreams.prototype.pushMerge = function(){
  this._cnt = 0;

  var merged = {};
  this._tmps.forEach(function(ob, i){
    for(var key in ob){
      merged[key] = ob[key];
    }
    this._tmps[i] = {};
  }, this);

  this._sync = true;
  this._flowedIds = [];
  this.push(merged);  

};

module.exports = MergeObjectStreams;
