/* Thin YouTube Playables SDK adapter (HEYYANIXX Studio).
   Inside YouTube Playables the official SDK (https://www.youtube.com/game_api/v1) is loaded
   by index.html before this file and defines the global `ytgame`. Everywhere else every call
   below is a safe no-op / localStorage fallback. API names per
   developers.google.com/youtube/gaming/playables/reference/sdk */
(function () {
  var KEY = 'ekAurAayega.save.v1';
  function inYT() {
    try { return typeof ytgame !== 'undefined' && !!ytgame.IN_PLAYABLES_ENV; } catch (e) { return false; }
  }
  var PG = {
    get inYouTube() { return inYT(); },
    firstFrameReady: function () { if (inYT()) try { ytgame.game.firstFrameReady(); } catch (e) {} },
    gameReady: function () { if (inYT()) try { ytgame.game.gameReady(); } catch (e) {} },
    loadData: function () {
      if (inYT()) {
        return ytgame.game.loadData().then(function (s) { return s || ''; }, function () { return ''; });
      }
      try { return Promise.resolve(localStorage.getItem(KEY) || ''); } catch (e) { return Promise.resolve(''); }
    },
    saveData: function (str) {
      if (inYT()) { try { return ytgame.game.saveData(str).catch(function () {}); } catch (e) { return Promise.resolve(); } }
      try { localStorage.setItem(KEY, str); } catch (e) {}
      return Promise.resolve();
    },
    sendScore: function (n) {
      if (inYT()) try { ytgame.engagement.sendScore({ value: Math.floor(n) }).catch(function () {}); } catch (e) {}
    },
    isAudioEnabled: function () {
      if (inYT()) try { return ytgame.system.isAudioEnabled(); } catch (e) {}
      return true;
    },
    onAudioEnabledChange: function (cb) { if (inYT()) try { ytgame.system.onAudioEnabledChange(cb); } catch (e) {} },
    onPause: function (cb) { if (inYT()) try { ytgame.system.onPause(cb); } catch (e) {} },
    onResume: function (cb) { if (inYT()) try { ytgame.system.onResume(cb); } catch (e) {} },
    logError: function () { if (inYT()) try { ytgame.health.logError(); } catch (e) {} }
  };
  window.PG = PG;
})();
