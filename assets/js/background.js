console.log('Finisher Header loaded');
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.finisher-header.sunny')) {
        console.log('Finisher Header Sunny loaded');
        new FinisherHeader({
            "count": 12, // particules
            "size": {
              "min": 1076, // min
              "max": 1280, // max
              "pulse": 0 // pulsation
            },
            "speed": {
              "x": {
                "min": 0.6, // vitesse
                "max": 1 // vitesse
              },
              "y": {
                "min": 0.6, // vitesse
                "max": 1 // vitesse
              }
            },
            "colors": {
              "background": "#b1d0db", // fond
              "particles": [
                "#52ebff", // couleur
                "#0270ff",
                "#33bbff",
                "#01caee",
                "#276ab9",
                "#38c3ff"
              ]
            },
            "blending": "lighten", // fusion
            "opacity": {
              "center": 0.55, // centre
              "edge": 0 // bord
            },
            "shapes": [
              "c" // forme
            ]
          });
    }
    console.log('Page loaded');
});
