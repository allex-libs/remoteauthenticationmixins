function createRemoteStrategyServiceMixin (execlib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    qlib = lib.qlib;

  function RemoteStrategyServiceMixin (prophash) {
    if (!lib.isFunction(this.findRemote)) {
      throw new lib.Error('REMOTESERVICELISTNER_MIXIN_NOT_IMPLEMENTED', this.constructor.name+' has to implement execSuite.RemoteServiceListenerServiceMixin');                             
    }
    this.remoteAuthenticationActive = prophash && prophash.strategies && prophash.strategies.remote;
    if (this.remoteAuthenticationActive){
      this.findRemote(prophash.strategies.remote.sinkname, prophash.strategies.remote.identity || null, 'remoteauth');
    }
  }

  RemoteStrategyServiceMixin.prototype.destroy = function () {
    this.remoteAuthenticationActive = null;
  };

  RemoteStrategyServiceMixin.prototype.registerRemoteUser = function (userobj) {
    if (!this.remoteAuthenticationActive) {
      return q(userobj);
    }
    return this.registerRemoteUserOnRemoteSink(userobj);
  };
  RemoteStrategyServiceMixin.prototype.checkUsernameExistence = function (username) {
    if (!this.remoteAuthenticationActive) {
      return q(true);
    }
    return this.checkUsernameExistenceOnRemoteSink(username);
  };
  RemoteStrategyServiceMixin.prototype.fetchRemoteUser = function (username) {
    if (!this.remoteAuthenticationActive) {
      return q(null);
    }
    return this.fetchRemoteUserOnRemoteSink(username);
  };
  RemoteStrategyServiceMixin.prototype.forceRemotePassword = function (username, password) {
    if (!this.remoteAuthenticationActive) {
      return q(true);
    }
    return this.forceRemotePasswordOnRemoteSink(username, password);
  };

  RemoteStrategyServiceMixin.prototype.registerRemoteUserOnRemoteSink = execSuite.dependentServiceMethod([], ['remoteauth'], function (remoteauthsink, userobj, defer) {
    qlib.promise2defer(remoteauthsink.call('registerUser', userobj), defer);
  });
  RemoteStrategyServiceMixin.prototype.checkUsernameExistenceOnRemoteSink = execSuite.dependentServiceMethod([], ['remoteauth'], function (remoteauthsink, username, defer) {
    qlib.promise2defer(remoteauthsink.call('usernameExists', username), defer);
  });
  RemoteStrategyServiceMixin.prototype.fetchRemoteUserOnRemoteSink = execSuite.dependentServiceMethod([], ['remoteauth'], function (remoteauthsink, username, defer) {
    qlib.promise2defer(remoteauthsink.call('fetchUser', {username: username}), defer);
  });
  RemoteStrategyServiceMixin.prototype.forceRemotePasswordOnRemoteSink = execSuite.dependentServiceMethod([], ['remoteauth'], function (remoteauthsink, username, password, defer) {
    qlib.promise2defer(remoteauthsink.call('forcePassword', username, password), defer);
  });

  function onRemoteDBSink (rsm, remotedbsink) {
    if(!(rsm && rsm.destroyed)){
      remotedbsink.destroy();
      rsm = null;
      return;
    }
    rsm.remoteDBSink = remotedbsink;
    rsm = null;
  };

  RemoteStrategyServiceMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, RemoteStrategyServiceMixin
      ,'registerRemoteUser'
      ,'registerRemoteUserOnRemoteSink'
      ,'checkUsernameExistence'
      ,'checkUsernameExistenceOnRemoteSink'
      ,'fetchRemoteUser'
      ,'fetchRemoteUserOnRemoteSink'
      ,'forceRemotePassword'
      ,'forceRemotePasswordOnRemoteSink'
    );
  };

  return RemoteStrategyServiceMixin;
}

module.exports = createRemoteStrategyServiceMixin;
