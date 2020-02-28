// ===================
// 俄罗斯方块核心模块
// ===================
var TetrisCore = function(width, height){
	this.bgWidth = width === undefined ? 10 : (width < 4 ? 4 : (width > 24 ? 24 : width));
	this.bgHeight = height === undefined ? 16 : (height < 4 ? 4 : (height > 50 ? 50 : height));
	this.bgArr = [];
	this.iArr  = [
		[[7,2,0,0],[2,3,2,0],[2,7,0,0],[2,6,2,0]],
		[[6,4,4,0],[4,7,0,0],[2,2,6,0],[7,1,0,0]],
		[[6,2,2,0],[7,4,0,0],[4,4,6,0],[1,7,0,0]],
		[[6,3,0,0],[2,6,4,0]],
		[[3,6,0,0],[4,6,2,0]],
		[[15,0,0,0],[2,2,2,2]],
		[[6,6,0,0]]
	];
	this.iRow = 0;
	this.iCol = 0;
	this.movingX = 0;             //方块X位置，从右到左，0~16
	this.movingY = this.bgHeight; //方块Y位置，从下到上，0~24
	this.isOver = false;
};
TetrisCore.prototype = {
	newShape : function(){
		this.iRow = parseInt(Math.random() * 7);
		this.iCol = parseInt(Math.random() * this.iArr[this.iRow].length);
		this.movingX = parseInt((this.bgWidth-4)/2);
		this.movingY = this.bgHeight; 
	},
	joinData : function(){
		for (var i = 0; i < 4; i++){
			var v = this.iArr[this.iRow][this.iCol][i];
			if(v > 0){
				var vfix = this.movingX < 0 ? v >> Math.abs(this.movingX) : v << this.movingX;
				if((this.movingY + i) < this.bgArr.length){
					this.bgArr[this.movingY + i] = this.bgArr[this.movingY + i] ^ vfix;
				}else{
					this.bgArr.push(vfix);
				}
			}
		}
		if(this.bgArr.length > this.bgHeight){
			this.isOver = true;
		}
	},
	checkData : function(){
		var lines = 0;
		for (var i = this.bgArr.length - 1; i >= 0; i--){
			if(this.bgArr[i] === (1 << this.bgWidth)-1){
				this.bgArr.splice(i, 1);
				lines++;
			}
		}
		return lines;
	},
	move : function(x,y,col){
		if(col === undefined){ col = this.iCol; }
		var tx = this.movingX + x;
		var ty = this.movingY + y;
		var isOK = true;
		for (var i=0; i<4; i++){
			var v = this.iArr[this.iRow][col][i];
			if(v > 0){
				if((ty + i) < 0){
					isOK = false;
					break;
				} //已到底
				if(tx < 0){//右边超出?
					if((v & (0x0F >> (4 + tx))) > 0){
						isOK = false;
						break;
					}
				}
				if(tx > this.bgWidth-4){//左边超出?
					if((v & (0xF0 >> (tx - (this.bgWidth-4)))) > 0){
						isOK = false;
						break;
					}
				}
				if((ty + i) < this.bgHeight){ //进入视图才进行检测
					if((ty + i) < this.bgArr.length){ // 小于数组长度才有交叉
						var vfix = tx < 0 ? v >> Math.abs(tx) : v << tx;
						if((this.bgArr[ty + i] & vfix) > 0){
							isOK = false;
							break;
						}
					}
				}
			}
		}
		if(isOK){
			this.movingX = tx;
			this.movingY = ty; 
		}else if(y<0){
			this.joinData();
		}
		return isOK;
	},
	moveDown : function(){return this.move(0, -1);},
	moveLeft : function(){return this.move(1,0);},
	moveRight : function(){return this.move(-1,0);},
	rotate : function(){
		var col = (this.iCol + 1) % this.iArr[this.iRow].length
		if(this.move(0, 0, col)){
			this.iCol = col;
			return true;
		}
		return false;
	},
	reset : function(){
		this.bgArr= [];
		this.isOver = false;
		this.newShape();
	},
	getShapeData:function(){
		return {
			x:this.movingX,
			y:this.movingY,
			data:this.iArr[this.iRow][this.iCol]
		};
	}
};
TetrisCore.test = function(){
	var game = new TetrisCore(10,20);
	console.log("初始化...");
	game.reset();
	var check = false;
	var timer = setInterval(function(){
		if(check){
			console.log("正在检测...");
			if(game.isOver){
				console.log("已超过顶部，Game Over...");
				clearInterval(timer);
				alert("Game Over!");
				return;
			}
			var lines = game.checkData();
			console.log("消除 "+lines+" 行");
			//if(lines>0){如有消除行，可在这里更新渲染方块池状态...}
			check = false;
			console.log("生成新方块...");
			game.newShape();
		}
		if(!game.moveDown()){
			console.log("不可下降，打开检测开关...");
			check = true;
			//（可在这里更新渲染方块池状态...）
		}else{
			console.log("继续下降...");
			//（可在这里更新渲染方块位置...）
		}
	},200);
};
