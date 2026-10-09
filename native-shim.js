/* Android APK: ઍપમાં પહેલેથી ડાઉનલોડ/પ્રિન્ટ/બેક-બટનનો કોડ છે; અહીં ફક્ત ખાતરી કરીએ છીએ કે Capacitor.Plugins માં Filesystem, Share, App ઉપલબ્ધ છે. */
(function(){
 var C=window.Capacitor; if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
 C.Plugins=C.Plugins||{};
 ['Filesystem','Share','App'].forEach(function(n){try{if(!C.Plugins[n]&&C.registerPlugin)C.Plugins[n]=C.registerPlugin(n)}catch(e){}});
})();
