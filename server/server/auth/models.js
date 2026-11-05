import _ from 'lodash';
// import User from '../models/user.model';
import OAuthClient from './OAuthClient';
import OAuthAccessToken from './OAuthAccessToken';
import OAuthAuthorizationCode from './OAuthAuthorizationCode';
import OAuthRefreshToken from './OAuthRefreshToken';


function getAccessToken(bearerToken) {
  console.log("getAccessToken", bearerToken)
  return OAuthAccessToken
    //User,OAuthClient
    .findOne({ access_token: bearerToken })
    .populate('User')
    .populate('OAuthClient')
    .then(function (accessToken) {
      console.log('at', accessToken)
      if (!accessToken) return false;
      var token = accessToken;
      token.user = token.User;
      token.client = token.OAuthClient;
      token.scope = token.scope
      return token;
    })
    .catch(function (err) {
      console.log("getAccessToken - Err: ")
    });
}

function getClient(clientId, clientSecret) {
  console.log("getClient", clientId, clientSecret)
  const options = { client_id: clientId };
  if (clientSecret) options.client_secret = clientSecret;

  return OAuthClient
    .findOne(options)
    .then(function (client) {
      if (!client) return new Error("client not found");
      var clientWithGrants = client
      clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials']
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
      delete clientWithGrants.redirect_uri;
      //clientWithGrants.refreshTokenLifetime = integer optional
      //clientWithGrants.accessTokenLifetime  = integer optional
      return clientWithGrants
    }).catch(function (err) {
      console.log("getClient - Err: ", err)
    });
}


function getUser(username, password) {
  return User
    .findOne({ username: username })
    .then(function (user) {
      return user.authenticate(password) ? user : false;
    })
    .catch(function (err) {
      console.log("getUser - Err: ", err)
    });
}

function revokeAuthorizationCode(code) {
  console.log("revokeAuthorizationCode", code)
  return OAuthAuthorizationCode.findOne({
    where: {
      authorization_code: code.code
    }
  }).then(function (rCode) {
    var expiredCode = code
    expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredCode
  }).catch(function (err) {
    console.log("getUser - Err: ", err)
  });
}

function revokeToken(token) {
  console.log("revokeToken", token)
  return OAuthRefreshToken.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  }).then(function (rT) {
    if (rT) rT.destroy();
    var expiredToken = token;
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken;
  }).catch(function (err) {
    console.log("revokeToken - Err: ", err)
  });
}


function saveToken(token, client, user) {
  return Promise.all([
    OAuthAccessToken.create({
      access_token: token.accessToken,
      expires: token.accessTokenExpiresAt,
      OAuthClient: client._id,
      User: user._id,
      scope: token.scope
    }),
    token.refreshToken ? OAuthRefreshToken.create({ // no refresh token for client_credentials
      refresh_token: token.refreshToken,
      expires: token.refreshTokenExpiresAt,
      OAuthClient: client._id,
      User: user._id,
      scope: token.scope
    }) : [],

  ])
    .then(function (resultsArray) {
      return _.assign(  // expected to return client and user, but not returning
        {
          client: client,
          user: user,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken, // proxy
        },
        token
      )
    })
    .catch(function (err) {
      console.log("revokeToken - Err: ", err)
    });
}

function getAuthorizationCode(code) {
  console.log("getAuthorizationCode", code)
  return OAuthAuthorizationCode
    .findOne({ authorization_code: code })
    .populate('User')
    .populate('OAuthClient')
    .then(function (authCodeModel) {
      if (!authCodeModel) return false;
      var client = authCodeModel.OAuthClient;
      var user = authCodeModel.User;
      return reCode = {
        code: code,
        client: client,
        expiresAt: authCodeModel.expires,
        redirectUri: client.redirect_uri,
        user: user,
        scope: authCodeModel.scope,
      };
    }).catch(function (err) {
      console.log("getAuthorizationCode - Err: ", err)
    });
}

function saveAuthorizationCode(code, client, user) {
  console.log("saveAuthorizationCode", code, client, user)
  return OAuthAuthorizationCode
    .create({
      expires: code.expiresAt,
      OAuthClient: client._id,
      authorization_code: code.authorizationCode,
      User: user._id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode;
      return code
    }).catch(function (err) {
      console.log("saveAuthorizationCode - Err: ", err)
    });
}

function getUserFromClient(client) {
  console.log("getUserFromClient", client)
  var options = { client_id: client.client_id };
  if (client.client_secret) options.client_secret = client.client_secret;

  return OAuthClient
    .findOne(options)
    .populate('User')
    .then(function (client) {
      console.log(client)
      if (!client) return false;
      if (!client.User) return false;
      return client.User;
    }).catch(function (err) {
      console.log("getUserFromClient - Err: ", err)
    });
}

function getRefreshToken(refreshToken) {
  console.log("getRefreshToken", refreshToken)
  if (!refreshToken || refreshToken === 'undefined') return false
  //[OAuthClient, User]
  return OAuthRefreshToken
    .findOne({ refresh_token: refreshToken })
    .populate('User')
    .populate('OAuthClient')
    .then(function (savedRT) {
      console.log("srt", savedRT)
      var tokenTemp = {
        user: savedRT ? savedRT.User : {},
        client: savedRT ? savedRT.OAuthClient : {},
        refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
        refreshToken: refreshToken,
        refresh_token: refreshToken,
        scope: savedRT.scope
      };
      return tokenTemp;

    }).catch(function (err) {
      console.log("getRefreshToken - Err: ", err)
    });
}

function validateScope(token, client, scope) {
  console.log("validateScope", token, client, scope)
  return (token.scope === client.scope) ? scope : false
}

function verifyScope(token, scope) {
  console.log("verifyScope", token, scope)
  return token.scope === scope;
}


export default {
  getAccessToken,
  getAuthorizationCode,
  getClient,
  getRefreshToken,
  getUser,
  getUserFromClient,
  revokeAuthorizationCode,
  revokeToken,
  saveToken,//saveOAuthAccessToken, renamed to
  saveAuthorizationCode, //renamed saveOAuthAuthorizationCode,
  //validateScope: validateScope,
  verifyScope,
}
