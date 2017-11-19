let todoData = [];

//todo list
    let todoApp = new Vue({
        el: '#todo',
        data: {
            todoList: todoData,
        },
        methods: {
            //count the amount of items that have not be done
            getCount: function(){
                let count = 0;
                this.todoList.forEach(item=>{count += item.status ? 0 : 1;});
                return count;
            },
            //add todo item
            addTodo: function(){
                let todoText = document.querySelector('#todo-text');
                let value = todoText.value.trim();
                if(value != '' && this.textLength(value)<=46){
                    let itemId = randomNum();
                    this.todoList.push({todo: value, status: false, id: itemId});
                    todoText.value = '';
                    itemId = null;
                } else{
                    alert('提示：请输入有效长度的文字，中文少于23字，英文少于46字');
                }        
            },
            //press "enter" to add todo
            addTodoByKey: function(e){
                if(e.keyCode==13) this.addTodo();
            },
            //get the real length of the text 
            textLength: function(_text){
                let realLength = 0, len = _text.length;
                for(let i=0; i<len; i++){
                    realLength += _text.charCodeAt(i)<128 ? 1 : 2;  //the char code of English is less than 128
                }
                return realLength;
            },
            //delete todo items
            xDone: function(){
                if(this.deleteOrNot()){
                    let len = this.todoList.length-1;
                    for(len; len>=0; --len){
                        if(this.todoList[len].status) this.todoList.splice(len, 1);
                    };
                }
            },
            //delte a single item
            delItem: function(e){        
                let target = e.target;
                if(target.className && target.className=='del-item'){
                    if(this.deleteOrNot()){
                        let item = target.parentNode;
                        let wholeItem = item.parentNode.querySelectorAll('li');
                        this.todoList.splice(this.getIndex(item, wholeItem), 1);
                    }            
                }        
            },
            //confirm to delete or not
            deleteOrNot: function(){
                return confirm('确认删除？') ? true : false;
            },
            //find a certain element's index     _item: the current element; _whole: the same type of elements including the current one
            getIndex: function(_item, _whole){
                for(let i=0; i<_whole.length; i++){
                    if(_whole[i]==_item) return i;
                }
            }
        }
    });

//file
let filePart = new Vue({
    el: '#file-box',
    data: {},
    methods: {
        generFile: function(){
            if(todoData.length>0){
                let fileName = 'my_todo_list_' + randomNum() + '.txt';
                let cutLine = '***************************************************************';
                let blankLine = '\r\n\r\n';
                let contentArr = [];
                todoData.forEach((item, index)=>{
                    let done = item.status ? 'OK' : ' ';
                    contentArr.push(`(${index+1}). ${item.todo} ----(${done})`);
                });
                let content = generDate() + blankLine + '待办事项：' + blankLine + cutLine + blankLine + contentArr.join(blankLine) + blankLine + cutLine;
                downloadFile('.generate-file', fileName, content)
            } else{
                alert('暂无待办事项');
            }          
        },
        importFile: function(e){
            readFile(e.target.files[0], (data)=>{
                todoData.push(...this.parseData(data));   //push array  use es6 spread operator
                e.target.value = '';     
                e.target.blur();
            });
        },
        parseData: function(_data, _cb){
            let output = [];
            let pattern = {
                content: /\*{6,}(.*\r\n*)*\*{6,}/,
                item: /\(\d+\)\.(.*)/,
                result: /(.*)-{4}\((.*)\)/
            };
            let contain = pattern.content.exec(_data); //reg --get the main part
            if(contain){
                let itemArr = [];
                contain[0].split('\r\n').forEach((item, index)=>{
                    let iContain = pattern.item.exec(item);  //reg --get the todo item
                    if(iContain){
                        let result = pattern.result.exec(iContain[1]);  //reg  get the detail of todo item
                        let status = result[2]=='OK' ? true : false;
                        let itemId = randomNum();
                        output.push({todo: result[1].trim(), status: status, id: itemId});
                    }
                });
            } 
            else alert('提示：请按规定格式排版');
            return output;
        }
    }
});

//background
let background = new Vue({
    el: '#bg',
    data: {
        baseUrl: './img/bg/',
        imgUrl: './img/bg/1.png',
        imgArr: ['1.png', '2.png', '3.png'],
        imgIndex: 0,
        timeInfo: ''
    },
    methods: {
        changeImg: function(_index){
            let imgSrc = this.baseUrl + this.imgArr[_index];
            this.imgUrl = imgSrc;
        },
        prevImg: function(){
            let maxIndex = this.imgArr.length - 1;
            this.imgIndex = this.imgIndex<=0 ? maxIndex : this.imgIndex - 1;
            this.changeImg(this.imgIndex);
        },
        nextImg: function(){
            let maxIndex = this.imgArr.length - 1;
            this.imgIndex = this.imgIndex>=maxIndex ? 0 : this.imgIndex + 1;
            this.changeImg(this.imgIndex);
        },      
        clockTime: function(){
            this.timeInfo = generDate();
        }
    },
    computed: {
        clock: function(){
            setInterval(()=>{this.clockTime()}, 1000);
        }
    }
});

function randomNum(){
    let time = new Date();
    return Math.floor(Math.random() * 1000) + time.getTime();
}
//read a text file    _file is the file object
function readFile(_file, _cb){
    let reader = new FileReader();
    reader.onload = function(){_cb(this.result)};
    reader.readAsText(_file);
}

function downloadFile(_el, _fileName, _content){
    let aTag = document.querySelector(_el);
    let blob = new Blob([_content]);
    aTag.download = _fileName;
    aTag.href = URL.createObjectURL(blob);
}

function generDate(){
    let time = new Date();
    let o = {
        year: time.getFullYear(),
        month: (time.getMonth() + 1)<10 ? '0'+(time.getMonth() + 1) : (time.getMonth() + 1),
        date: time.getDate()<10 ? '0'+time.getDate() : time.getDate(),
        hour: time.getHours()<10 ? '0'+time.getHours() : time.getHours(),
        minute: time.getMinutes()<10 ? '0'+time.getMinutes() : time.getMinutes(),
        second: time.getSeconds()<10 ? '0'+time.getSeconds() : time.getSeconds(),
        day: time.getDay()
    }
    let week = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'];
    return `${o.year}年${o.month}月${o.date}日  ${o.hour}:${o.minute}:${o.second}  ${week[o.day]}`;
}
