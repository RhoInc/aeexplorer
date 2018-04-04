//If in local environment...
if (window.origin !== 'https://rhoinc.github.io') {
    var head = document.getElementsByTagName('head')[0];

  //...load local build.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '../aeTable.js';
    head.appendChild(script);

  //...load local stylesheet.
    for (var i = 0; i < document.styleSheets.length; i++) {
        var styleSheet = document.styleSheets[i];
        if (styleSheet.href.indexOf('aeTable') > -1)
            styleSheet.disabled = true;
    }
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = '../../css/aeTable.css';
    head.appendChild(link);
}

d3.csv(
    'https://rawgit.com/RhoInc/viz-library/master/data/safetyData/ADAE.csv',
    function(error,data) {
        if (error)
            console.log(error);

        var settings = {};
        var instance = aeTable.createChart(
            '#container',
            settings
        );
        instance.init(data);
    }
);
