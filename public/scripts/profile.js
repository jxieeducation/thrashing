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
        tooltip: true,
                    subDomainTitleFormat: {
                empty: "No contributions on {date}",
                filled: "{count} contributions on {date}"
            },
        highlight: new Date()
    });
}

$(document).ready(function() {
    init_heatmap();
});
