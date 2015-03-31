function init_heatmap(){
    var cal = new CalHeatMap();
    var start_date = new Date();
    var profile_id = document.getElementById('profile-id').innerHTML;
    start_date.setMonth(start_date.getMonth() - 5);

    cal.init({
        start: start_date,
        range: 6,
        domain: "month",
        subDomain: "day",
        data: "/api/profile/calendar/" + profile_id + "/{{t:start}}/{{t:end}}",
        cellSize: 13,
        legend: [1, 3, 5],
        displayLegend: false,
        highlight: new Date(),//highlight today
        onClick: function(date, nb) {
            var display_string = nb.toString() + " contributions on " + (date.getMonth() + 1).toString() + "/" + date.getDate() + "/" + date.getFullYear();
            document.getElementById('heatmap-grid-info').innerHTML = display_string;
        }
    });
}

$(document).ready(function() {
    init_heatmap();
});
