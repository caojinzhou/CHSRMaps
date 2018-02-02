var show_circle = 5
var host = 'http://127.0.0.1:9519'
var is_branch = false

function now_change_id() {
    return $("#now_alter_id").val()
}

function saveDatas(value) {
    var old = $("#saveBranchData").val()
    old = old + "," + value
    $("#saveBranchData").val(old)
}

$(document).on('click', '.nodata', function() {
    var station_name = $("#search-form").val()
    $.post(host + '/crh/addNewStation', { 'station_name': station_name }, function(data) {
        if (data.code == 200) {
            var tem = searchResultTemplate(data.result.train_name, data.result.station_id, data.result.longtitude, data.result.latitude, data.train_address)
            $("#fright").append(tem)
        } else {
            alert(data.msg)
        }
    })
})
$(document).on('click', '.new-branch', function() {
    startBranch()
})
$(document).on('click', '.finish-branch', function() {
    finishBranch()
})

function startBranch() {
    var svg_id = $("#crh_en_name").val()
    $("#orginal_svg_path").val($("#" + svg_id).attr("points"))
    $("#logs").append("分叉中: ----------------\n")
    $(".new-branch").hide()
    $(".finish-branch").show()

    //将现在保存的path放到saveBeforeBranch中
    if (!is_branch) {
        var old = $("#saveBranchData").val()
        $("#saveBeforeBranch").val($("#saveBranchData").val())
        $("#saveBranchData").val("")
    }
    is_branch = true
    var mydate = new Date();
    var reandId = "sdfsdf" + mydate.getMilliseconds()
    $("#now_alter_id").val(reandId)
    var old_orginal = $("#orginal_svg_path").val()
    var color = $("#train_color").val()
    var weight = $("#train_weight").val()
    d3.select("svg").append("polyline")
        .attr("points", old_orginal)
        .attr("id", reandId)
        .attr("style", "fill:none;stroke:" + color + ";stroke-width:" + weight);
}

function finishBranch() {
    var old = $("#saveBranchData").val()
    $("#saveBranchData").val(old + " __&&__ ")
    $("#logs").append("此分支结束: ----------------\n")
    $(".finish-branch").hide()
    $(".new-branch").show()
}

function checkStart() {
    var checkS = $("#checkStart").val()
    if (checkS != "1") {
        return false
    }
    return true
}

function autoshow() {
    $.get(host + "/crh/showData", function(data) {
        if (data.code == 200) {
            $.each(data.result, function(index, rest) {
                $.each(rest.data, function(k, v) {
                    d3.select("svg").append("polyline")
                        .attr("points", v)
                        .attr("id", rest.train_name)
                        .attr("style", "fill:none;stroke:" + rest.train_color + ";stroke-width:" + rest.train_weight);
                })
            })
        }
        $.get('/js/CRH.json', function(data) {
            $.each(data, function(index, rest) {
                d3.select("svg").append("circle")
                    .attr("cx", rest.cx)
                    .attr("cy", rest.cy)
                    .attr("r", rest.r)
                    .attr("aid", rest.aid)
                    .attr("stroke", rest.stroke)
                    .attr("fill", rest.fill)
                    .attr("alt", rest.alt)
            })
        })
    })
}

function searchResultTemplate(station_name, station_id, lo, la, address) {
    return '<div class="finformation"> <input type="text" class="station_name" value="' + station_name + '" readonly><input type="text" class="station_address" value="' + address + '" readonly><input type="text" class="station_id" value="' + station_id + '" readonly> <input type="text" class="station_x" value="' + la + '" readonly> <input type="text" class="station_y" value="' + lo + '" readonly><button class="add">add</button></div>'
}

function writeData(station_name, station_id, la, lo) {
    $("#logs").append("线路: " + station_name + "\n")
    var crh_en_name = now_change_id()
    var points = $("#" + crh_en_name).attr("points")
    if (la != 0 && la != 'null') {
        $("#" + crh_en_name).attr("points", points + la + "," + lo + " ")
    }
    var scrollTop = $("#logs")[0].scrollHeight;
    $("#logs").scrollTop(scrollTop);
    saveDatas(station_id)
}
$(document).on('click', '.add', function() {
    var check = checkStart()
    if (check == false) {
        return
    }
    var crh_en_name = $("#crh_en_name").val()
    var search_res = $(this).parents(".finformation")
    var station_id = search_res.find(".station_id").val()
    var station_name = search_res.find(".station_name").val()
    var la = search_res.find(".station_x").val()
    var lo = search_res.find(".station_y").val()
    writeData(station_name, station_id, la, lo)
})

function emptyTemplate() {
    return '<div class="emptydata"><button class="nodata">没有你要的数据?</button></div>'
}
$(document).ready(function() {
    $(".branch-form").hide()
    $(".finish-branch").hide()
    autoshow()
    $("#end").hide();
    $("#search").hide();
    $("#fright").hide();
    $("#end").click(function() {
        if (!is_branch) {
            var old = $("#saveBranchData").val()
            $("#saveBeforeBranch").val(old)
            $("#saveBranchData").val("")
        }
        var postData = {
            'station_name': $("#crh_name").val(),
            'color': $("#crh_color").val(),
            'before': $("#saveBeforeBranch").val(),
            'after': $("#saveBranchData").val()
        }
        $.post(host + '/crh/saveData', postData, function(data) {
            if (data.code == 200) {
                alert("保存成功");
                history.go(0)
            } else {
                alert(data.msg)
            }
        })
    })
    $("#search-start").click(function() {
        var search_keyword = $("#search-form").val()
        if (search_keyword == "") {
            return
        }
        $("#fright").empty()
        $.get(host + "/crh/searchStation?station_name=" + search_keyword, function(data, status) {
            if (data.code == 200) {
                var tem = ''
                $.each(data.result, function(index, station_info) {
                    tem += searchResultTemplate(station_info.train_name, station_info.id, station_info.latitude, station_info.longtitude, station_info.train_address)
                })
            }
            var empty_tem = emptyTemplate()
            $("#fright").show().append(tem).append(empty_tem)
        })
    })
    $("#start").click(function() {
        var crh_name = $("#crh_name").val()
        var crh_en_name = $("#crh_en_name").val()
        var crh_color = $("#crh_color").val()
        if (crh_color == "") {
            crh_color = "#000"
        }
        if (crh_name == "" || crh_en_name == "") {
            return;
        }
        $("#logs").append("开始初始化相关代码....\n")
        $("#end").show();
        $("#search").show();
        $("#crh_name").attr("readonly", true)
        $("#crh_en_name").attr("readonly", true)
        $("#start").hide();
        d3.select("svg").append("polyline")
            .attr("points", "")
            .attr("id", crh_en_name)
            .attr("style", "fill:none;stroke:" + crh_color + ";stroke-width:3");
        $("#logs").append("开始录制相关信息....\n")
        $("#logs").append("-------------------------\n")
        $("#logs").append("线路名称:" + crh_name + "\n")
        $("#logs").append("线路名称拼音:" + crh_en_name + "\n")
        $("#logs").append("-------------------------\n")
        $("#checkStart").val("1")
        $("#train_color").val(crh_color)
        $("#train_weight").val(3)
        $("#now_alter_id").val(crh_en_name)
        $(".branch-form").show()
    })
})
$(document).on("click", "circle", function() {
    var check = checkStart()
    if (check == false) {
        return
    }
    var crh_name = $("#crh_name").val()
    var crh_en_name = $("#crh_en_name").val()
    var station_name = $(this).attr("alt")
    var la = $(this).attr("cx")
    var lo = $(this).attr("cy")
    var station_id = $(this).attr("aid")
    writeData(station_name, station_id, la, lo)
})
$(document).on("mouseover mouseout", "circle", function(event) {
    if (event.type == "mouseover") {
        var old_r = parseInt($(this).attr("r"));
        $(this).attr("r", old_r + show_circle);
        $("#station").val($(this).attr("alt"))
        $("#station_id").val($(this).attr("aid"))
    } else if (event.type == "mouseout") {
        var old_r = parseInt($(this).attr("r"));
        $(this).attr("r", old_r - show_circle);
        $("#station").val("")
        $("#station_id").val("")
    }
})