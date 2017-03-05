$(function () {
    var arr = [];
    var score = 0;

    layOut();
    newGame();

//  1.绝对定位布局
    function layOut() {
        for (var i = 0; i < 16; i++) {
            $('<li></li>').appendTo('ul');
        }

        for (var i = 0; i < $('li').length; i++) {
            arr.push({
                "l": Math.ceil($('li').eq(i).position().left),
                "t": Math.ceil($('li').eq(i).position().top)
            });
            $('li').eq(i).css({"left": arr[i].l + "px", "top": arr[i].t + "px"});
        }
        $('li').css({"position": "absolute"});
    }

//2.获取不重复的随机位置
    //2.1获取当前所有数字方块位置的数组
    function gridArr() {
        var arrNum = [];
        var oNumbers = $('.number');
        for (var i = 0; i < oNumbers.length; i++) {
            arrNum.push({
                "l": Math.round(oNumbers.eq(i).position().left),
                "t": Math.round(oNumbers.eq(i).position().top)
            });
        }
        return arrNum;
    }

    //2.2返回一个随机的空位置
    function randomArray() {
        //复制一份数组arr，防止arr被修改
        var arr2 = arr.concat([]);
        var arrNum = gridArr();
        //2个数组去重后，随机返回剩余中的一个位置
        for (var i = 0; i < arrNum.length; i++) {
            for (var j = 0; j < arr2.length; j++) {
                if (arrNum[i].l == arr2[j].l && arrNum[i].t == arr2[j].t) {
                    arr2.splice(j, 1);
                }
            }
        }
        return arr2[Math.floor(Math.random() * arr2.length)];
    }

    //3.添加新数字方块
    function createGrid() {
        var arr = randomArray();
        var oGrid = $('<li></li>');
        oGrid.html(Math.random() > 0.2 ? 2 : 4);
        oGrid.addClass("number").addClass("n" + oGrid.html());

        if ($('.number').length < 16) {
            oGrid.css({"left": arr.l + "px", "top": arr.t + "px"});
            oGrid.appendTo('ul');
        }
    }

//获取同行或列的方块元素,并按升序排列
    /*	返回一个数组，数组为全部行（列）数字方块元素的集合
     *   arr = [
     *           [1,2,3,4],
     *           [1,2,3,4],
     *           [1,2,3,4],
     *           [1,2,3,4],
     *       ];

     */
    function getPosition(dir) {
        var arr = [];
        var oNumbers = $('.number');
        var dir2 = dir == "left" ? "top" : "left";
        for (var j = 0; j < 4; j++) {
            var arr1 = [],
                arr2 = [];
            for (var i = 0; i < oNumbers.length; i++) {
                if (Math.round(oNumbers.eq(i).position()[dir]) == j * 55) {
                    arr1.push(oNumbers.eq(i));
                }
            }

            arr2 = arr1.sort(function (a, b) {
                return a.position()[dir2] - b.position()[dir2];
            });
            arr.push(arr2);

        }
        return arr;
    }

//		改变颜色
    function changeColor(obj) {
        var a = obj.html();
        var b = obj.attr('class').split(" ");
        if (b.length > 0) {
            obj.removeClass(b[1]).addClass("n" + a);
            score += parseInt(obj.html());
            $("#score").html(score);
        }

    }

    /*全部左移动
     1.判断能否合并;
     2.1 不能 按顺序排列
     2.2 能   计算每个合并后的坐标，（回调中完成 -> 移动完成后目标方块数字值翻倍，删除被合并的方块） 
     */
//	定义开关ended监控运动是否完成
    var ended = true;
//	定义开关needcreate监控是否满足生成方块条件
    var needcreate = false;
//		全部行（列）移动
//		接收参数arr为单行（列）方块元素的集合
    //	move(arr,index,json,true);

    function move(arr, num, dir, Reverse, endFn) {
        var json = {};
        var a;
        for (var i = 0; i < arr.length; i++) {
            ended = false;
            if (!Reverse) {
                a = i;
                if (num.length == 2) {
                    json[dir] = i <= 1 ? "0px" : "55px";
                } else if (num.length == 1) {
                    json[dir] = i > num[0] ? (i - 1) * 55 + "px" : i * 55 + "px";
                } else {
                    json[dir] = i * 55 + "px";
                }

            } else {
                a = arr.length - 1 - i;
                if (num.length == 2) {
                    json[dir] = i <= 1 ? "165px" : "110px";
                } else if (num.length == 1) {
                    json[dir] = i > (3 - num[0]) ? (4 - i) * 55 + "px" : (3 - i) * 55 + "px";
                } else {
                    json[dir] = (3 - i) * 55 + "px";
                }
            }
            arr[a].animate(json, 200, "swing", function () {
                ended = true;
                endFn && endFn();
            });

        }

        (function (arr, num) {
            var a = 0;
            var timer = setInterval(function () {
                a += 30;
                if (a > 300) {
                    clearInterval(timer);
                }
                if (ended) {
                    for (var i = 0; i < num.length; i++) {
                        arr[num[i]].html(arr[num[i]].html() * 2);
                        changeColor(arr[num[i]]);
                        !Reverse ? arr[num[i] + 1].remove() : arr[num[i] - 1].remove();
                        clearInterval(timer);
                    }
                }

            }, 30)
        })(arr, num);

    }

    function goDir(dir, Reverse) {
        var dir2 = dir == "left" ? "top" : "left";
        var arr = getPosition(dir2);
        var a, b, c, d;
        Reverse = Reverse || false;
        needcreate = false;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].length == 0) {
                continue;
            }
            //		定义num:存放数字翻倍的方块的index
            var num = [];
            for (var j = 0; j < arr[i].length; j++) {
                if (!Reverse) {
                    a = b = j;
                    c = j;
                    d = j + 1;
                } else {
                    a = arr[i].length - 1 - j;
                    b = 3 - j;
                    c = arr[i].length - 1 - j;
                    d = arr[i].length - 2 - j;
                }

                if (Math.round(arr[i][a].position()[dir]) !== b * 55) {
                    needcreate = true;
                }

                if (arr[i][d] && arr[i][c].html() == arr[i][d].html()) {
                    needcreate = true;
                    num.push(c);
                    j++;
                }

            }
            move(arr[i], num, dir, Reverse);

        }
    }

    function cGrid() {
        var a = 0;
        var timer = setInterval(function () {
            a += 30;
            if (a > 400) {
                clearInterval(timer);
            }
            if (ended && needcreate) {
                createGrid();
                clearInterval(timer);
            }

        }, 30);
    }

    $(document).keydown(function (event) {
        var a = event.keyCode;
        if (a == 37 || a == 38 || a == 39 || a == 40) {
            if (ended) {
                switch (a) {
                    case 37:
                        goDir("left");
                        break;
                    case 38:
                        goDir("top");
                        break;
                    case 39:
                        goDir("left", true);
                        break;
                    case 40:
                        goDir("top", true);
                        break;
                }
                cGrid();
                gameOver();
            }

        }
    });

    //2种方法，1、取出所有值相等的元素，判断坐标有一个相等的情况下间距在50内，
    //         2、对16个方块循环，看周围是否有相同的值
    function over(arr) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length - 1; j++) {
                if (arr[i][j].html() == arr[i][j + 1].html()) {
                    return true;
                }
            }
        }
        return false;
    }

    function gameOver() {
        if ($('.number').length >= 16) {
            var arr1 = getPosition("left");
            var arr2 = getPosition("top");
            if (!(over(arr1) || over(arr2))) {
                alert("Game Over");
                newGame();
            }
        }

    }

    function newGame() {
        $(".number").remove();
        score = 0;
        $("#score").html(score);
        createGrid();
        createGrid();
    }

    $('#btn1').click(function () {
        newGame();
    });

});
