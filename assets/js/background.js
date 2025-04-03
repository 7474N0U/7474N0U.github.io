console.log('Finisher Header loaded');
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.finisher-header.sunny')) {
        console.log('Finisher Header Sunny loaded');
        new FinisherHeader({
            "count": 100,  // densité
            "size": {
                "min": 1300,  
                "max": 1550,  
                "pulse": 0.1  // pulsation
            },
            "speed": {
                "x": { "min": 0.2, "max": 1.2 },  // vitesseX
                "y": { "min": 0.2, "max": 1.2 }   // vitesseY
            },
            "colors": {
                "background": "#d9e7ec",
                "particles": [
                    "#1b3b6f", "#104b8e", "#487ebe",
                    "#66cdf9", "#ccf4fb", "#70ecfd",
                    "#32b9fc", "#026efa", "#003366", "#001a33"
                ]
            },
            "blending": "soft-light",  // fusion
            "opacity": {
                "center": 0.7,  // opacitéCentre
                "edge": 0.4   // opacitéBord
            },
            "skew": -0.5,  // distorsion
            "shapes": [ "c", "o" ]  // formes
        });
    }
    console.log('Page loaded');
});
