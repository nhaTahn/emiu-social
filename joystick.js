// Camera-relative analog input, shared by the pointer controller and garden.
export function stickVector(dx,dy,radius,deadZone=.12){
 if(![dx,dy,radius,deadZone].every(Number.isFinite)||radius<=0||deadZone<0||deadZone>=1)return {x:0,y:0};
 const distance=Math.hypot(dx,dy),amount=Math.min(1,distance/radius);
 if(amount<=deadZone)return {x:0,y:0};
 const strength=(amount-deadZone)/(1-deadZone);return {x:dx/distance*strength,y:dy/distance*strength};
}
export function cameraDirection(x,y,yaw){return {x:Math.cos(yaw)*x+Math.sin(yaw)*y,z:-Math.sin(yaw)*x+Math.cos(yaw)*y};}
export function smoothVelocity(previous,target,dt){
 const alpha=1-Math.exp(-18*Math.max(0,Math.min(.06,dt)));
 return {x:previous.x+(target.x-previous.x)*alpha,z:previous.z+(target.z-previous.z)*alpha};
}
export function turnToward(previous,target,dt){return previous+Math.atan2(Math.sin(target-previous),Math.cos(target-previous))*(1-Math.exp(-16*Math.max(0,dt)));}

export function bindJoystick(element,{onChange,isBlocked=()=>false,windowTarget=window,documentTarget=document}){
 let pointer=null,origin=null;
 function reset(){
  const old=pointer;pointer=null;origin=null;element.classList.remove('active');element.style.setProperty('--stick-x','0px');element.style.setProperty('--stick-y','0px');onChange({x:0,y:0});
  if(old!==null&&element.hasPointerCapture(old))element.releasePointerCapture(old);
 }
 function move(event){
  if(event.pointerId!==pointer)return;if(isBlocked()){reset();return;}
  event.preventDefault();const dx=event.clientX-origin.x,dy=event.clientY-origin.y,d=Math.hypot(dx,dy),limit=origin.radius,scale=d>limit?limit/d:1;
  element.style.setProperty('--stick-x',dx*scale+'px');element.style.setProperty('--stick-y',dy*scale+'px');onChange(stickVector(dx,dy,limit));
 }
 function down(event){
  if(pointer!==null||isBlocked()||event.button!==0)return;event.preventDefault();
  const bounds=element.getBoundingClientRect();pointer=event.pointerId;origin={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2,radius:bounds.width*.32};element.setPointerCapture(pointer);element.classList.add('active');move(event);
 }
 function up(event){if(event.pointerId===pointer)reset();}
 function hidden(){if(documentTarget.hidden)reset();}
 const bindings=[[element,'pointerdown',down],[element,'pointermove',move],[element,'pointerup',up],[element,'pointercancel',up],[element,'lostpointercapture',up],[windowTarget,'blur',reset],[windowTarget,'pagehide',reset],[documentTarget,'visibilitychange',hidden]];
 for(const [target,type,handler] of bindings)target.addEventListener(type,handler);
 return {reset,dispose(){reset();for(const [target,type,handler] of bindings)target.removeEventListener(type,handler);}};
}
