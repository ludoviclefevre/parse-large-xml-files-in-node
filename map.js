(function($, _, undefined){
    var self = this;

    var init = function() {
        var xy = d3.geo.albers()
            .center([2.6,46.5])
            .parallels([44,49])
            .scale(2700)
            .translate([250,250]);
        path = d3.geo.path().projection(xy);

        svg = d3.select("#map svg")
            //.call(d3.behavior.zoom().on("zoom", redraw))
            .append("g");
        var bg = svg.append("g")
            .attr("id", "background");
        /* Background must in fact be in front of user layer */
        svg.insert("g", "#background")
            .attr("id", "user_layer");

        d3.json('departements.json', function(err, json) {
            if (err) return console.warn(err);
            bg.selectAll("path")
                .data(json.features)
                .enter().append("path")
                .attr("d", path);
        });
    };

    $(init);
})(jQuery, _);