/**
 * This file contains the compiled script of the JSHON script in the index.html file.
 * It is not used in this project though, it is supposed to give you an idea of what
 * your JSHON scripts are compiled to. 
 * Unless you want to compile on the web browser (NOT RECOMMENDED FOR PRODUCTION) which you will require the JSHON web-compiler,
 * compilation is done during development time.
 * 
 * Tip: You can replace the JSHON script tag in the index.html file with this: <script src="./index.js"></script>
 * and it will still work
 */

      const {
        createApp, createComponent, render, setState,
        createCallback, setClass, getParentComponentRef,
        getSharedData, setInitArgs, getElement, writeDom,
        setAttribute
      } = JSHON.ui;

      //Our form component
      function TodoForm(){

        //Set up the component on creation
        //NOTE: `this.onCreation` is only called once in the components life time.
        this.onCreation = function(){
          //NOTE: `this` refers to the components object
          const todos = JSON.parse(localStorage.getItem('todos'))
          //Initialize the state object
          this.state = {

            list:todos?todos/*.slice(-3)*/.map((e,i)=>{
              e.index=i;
              return setInitArgs(ListItem.getInstanceRef(),e)
            }):[]//we use this to hold references to the todo list items we will create
          }

          //Allow access to the public. Other components can call these public methods or use it's properties
          this.public = {
            remove:createCallback(this,function(index){
              this.state.list[index] = null;
              setState(
                this,
                {list:this.state.list},
                //Passing `true` explicitly tells JSHON there has been a change in the states object.
                //Mormally, no update will happen since the list array object of the state has not changed
                true
              )
            })
          };

          //We must explicitly permit JSHON to keep this state object even when this component
          //is detached/unmounted from the DOM.
          this.keepStateOnDetach(true);
        };

        

        this.elements = {
          form:{
            onsubmit:createCallback(this,function(e){
              e.preventDefault()
              var data = {
                completed:false,
                index:this.state.list.length,
                text:getElement(this,"input").value
              };
              this.state.list.push(
                setInitArgs(ListItem.getInstanceRef(),data)
              );
              setAttribute(this,"input",{
                value:""
              });
              setState(
                this,
                {list:this.state.list},
                //Passing `true` explicitly tells JSHON there has been a change in the states object.
                //Mormally, no update will happen since the list array object of the state has not changed
                true
              );
              updateLS(data);
            })
          }
        }

        return (
          {t:'form',a:{"key":"form","id":"form"},c:[{t:'input',a:{"key":"input","type":"text","class":"input","id":"input","placeholder":"Enter your todo","autocomplete":"off"},c:[]},{t:'ul',a:{"class":"todos","id":"todos"},c:[function(args){return (this.state.list.map(e=>e?render(e):null))}]}]}
        )
      };

      //In JSHON, you must explicitly convert your component functions into
      //a JSHON component class.
      //As a result, we would only have to get a new reference to the TodoForm component
      //incase we want to create more than one todo form in our application.
      TodoForm = createComponent(TodoForm);

      function ListItem(){
        this.onCreation = function(){//props and index are passed as argument to this function by JSHON
          this.state={
            completed:!!this.initArgs.completed,
            index:this.initArgs.index
          };
          
          
        }
        //`this.onDetach()` is called when the component is about to be unmounted
        this.onDetach = function(){
          this.state={};
          this.resetAttrOnDetach(true);
        }
        this.elements = {
          item:{
            class:this.initArgs.completed?"completed":"",
            onclick:createCallback(this,function(){
              //Use setClass() to set/remove/add classnames on a keyed element
              //Toggle the class name
              setClass(this,"item",this.state.completed?{
                remove:['completed']
              }:{
                add:['completed']
              })
              //update state directly. This does not cause DOM updates
              this.state.completed = !this.state.completed;
              updateLS(null,this.state.index,this.state.completed)
            }),
            oncontextmenu:createCallback(this,function(e){
              e.preventDefault();
              getSharedData(getParentComponentRef(this)).remove(this.state.index);
              updateLS(null,this.state.index);
            })

          }
        };
        //Since we set a state object, we cannot access arguments passed to this component inside 
        //dynamic nodes
        this.text = this.initArgs.text;
        return (
          {t:'li',a:{"key":"item"},c:[function(args){return (this.text)}]}
        )
      }
      ListItem = createComponent(ListItem);

      function updateLS(data,index,completed) {
        const todos = JSON.parse(localStorage.getItem('todos'))
        if(!todos){
          todos = [];
        }
        if(!data){
          if(todos.length<index){
            if(typeof(completed)=="boolean"){
              todos[index].completed = completed;
            }else{
              todos.splice(index,1);
            }
          }
        }else{
          todos.push(data);
        }
        
        localStorage.setItem('todos', JSON.stringify(todos))
    }

      //Start the app
      createApp("/",createComponent(function App(){

        this.onCreation=function(){
          this.state = {
            //let's get and hold one referece to the TodoForm component
            form:TodoForm.getInstanceRef()
          };
          this.keepStateOnDetach(true);
        };

        return (
          {t:'div',a:{"class":"todo-container"},c:[{t:'h1',a:{},c:["todos"]},function(args){return (render(this.state.form))},{t:'small',a:{},c:["Left click to toggle completed. ",{t:'br',a:{},c:[]}," Right click to delete todo"]}]}
        )
      }).getInstanceRef(),function(){},document.body);