/* Scoring-aware art contract. This is schema/validation only; it does not award points.
 * Port indices N=0,E=1,S=2,W=3. The base topology still owns legal placement.
 */
'use strict';
const topology=require('./tile-topology.js');
const DIR=topology.directions;
const segment=(type,ports)=>({type,ports});
const feature=(id,type,x,y,extras={})=>({id,type,x,y,...extras});
const specs={
  causeway:{routes:[],features:[feature('willow-garden','garden',.5,.5,{boundary:'landscaped'})]},
  lake:{routes:[segment('water',[0,2])],features:[feature('lake-view','lake',.5,.5)]},
  tea:{routes:[],features:[feature('tea-house','teahouse',.76,.35,{access:'local-path',amenities:['tea']})]},
  pagoda:{routes:[segment('street',[1])],features:[feature('white-pagoda','viewpoint',.28,.65,{access:'street',views:['garden','water']})]},
  five:{routes:[segment('water',[0,2]),segment('street',[1,3])],features:[feature('five-pavilion-bridge','scenic-bridge',.5,.5)]},
  landing:{routes:[segment('street',[3])],features:[feature('breakfast-house','teahouse',.72,.7,{access:'street',amenities:['food']})]},
  street:{routes:[segment('street',[0,2])],features:[]},
  canal:{routes:[segment('water',[0,1])],features:[]},
  garden:{routes:[],features:[feature('garden-area','garden',.5,.5,{boundary:'enclosed'})]},
  court:{routes:[segment('street',[0])],features:[feature('courtyard-gate','gate',.5,.35,{access:'street'}),feature('courtyard','courtyard',.5,.65,{boundary:'walled'})]},
  market:{routes:[segment('street',[0,1,2,3])],features:[feature('food-market','food',.5,.5,{access:'street',amenities:['food']})]},
  bridge:{routes:[segment('water',[0,2]),segment('street',[1,3])],features:[feature('bridge','scenic-bridge',.5,.5)]},
  landingBasin:{routes:[segment('water',[0])],features:[feature('basin-landing','landing',.5,.58,{access:'water'})]},
  teaCanal:{routes:[segment('water',[1]),segment('street',[3])],features:[feature('tea-pier','pier',.72,.5,{access:'water'}),feature('tea-stall','teahouse',.28,.5,{access:'street'})]},
  gardenGate:{routes:[segment('street',[1])],features:[feature('garden-gate','gate',.72,.5,{access:'street'}),feature('pavilion','viewpoint',.38,.5,{access:'street',views:['garden']})]},
  roadEnd:{routes:[segment('street',[0])],features:[feature('road-destination','gate',.5,.58,{access:'street'})]}
};
const byName={
  'Canal-side teahouse':'teaCanal','Stone-paved street':'street',
  'Willow canal bend':'canal','Waterfront landing':'landingBasin',
  'Garden enclosure':'garden','Market crossroads':'market',
  'Canal crossroads':'canal','Street corner':'street',
  'Small stone bridge':'bridge','Garden pavilion':'gardenGate',
  'Walled courtyard':'court','Canal junction':'canal',
  'Mooring basin':'landingBasin'
};
const overrides={
  'Stone-paved street':[[0,2]],'Willow canal bend':[[0,1]],
  'Waterfront landing':[[1,3]],'Street corner':[[0,1]],
  'Garden pavilion':[[1]],'Walled courtyard':[[0]],
  'Canal junction':[[0,1,2]],'Mooring basin':[[0]],
  'Canal crossroads':[[0,1,2,3]]
};
function validate(tile,spec){
  const errors=[],ports=new Set();
  for(const route of spec.routes){
    if(!['street','water'].includes(route.type))errors.push('unknown route type');
    if(!Array.isArray(route.ports)||!route.ports.length)errors.push('empty route');
    for(const p of route.ports){
      if(!Number.isInteger(p)||p<0||p>3)errors.push('invalid port');
      else{
        if(tile.edges[p]!== (route.type==='street'?'S':'W'))errors.push('port type mismatch '+p);
        if(ports.has(p))errors.push('port reused '+p);
        ports.add(p);
      }
    }
  }
  tile.edges.forEach((e,i)=>{if(e!=='L'&&!ports.has(i))errors.push('unconnected external port '+i)});
  const ids=new Set();
  for(const f of spec.features){
    if(ids.has(f.id))errors.push('duplicate feature '+f.id);ids.add(f.id);
    if(!(f.x>=0&&f.x<=1&&f.y>=0&&f.y<=1))errors.push('feature outside square '+f.id);
  }
  return errors;
}
function makeSpec(tile){
  const key=tile.fixed?tile.kind:byName[tile.name]||tile.kind;
  const base=specs[key];
  if(!base)throw Error('Missing feature specification for '+tile.name);
  const groups=tile.fixed?base.routes.map(r=>r.ports):overrides[tile.name]||base.routes.map(r=>r.ports);
  const types=groups.map(g=>tile.edges[g[0]]==='W'?'water':'street');
  const result={routes:groups.map((g,i)=>segment(types[i],g)),features:base.features};
  const errors=validate(tile,result);
  if(errors.length)throw Error(tile.name+': '+errors.join('; '));
  return result;
}
function rotatedSpec(tile,rotation){
  const original=makeSpec(tile);
  return {routes:original.routes.map(r=>segment(r.type,r.ports.map(p=>(p+rotation)%4))),
    features:original.features.map(f=>({...f}))};
}
function auditStarter(){
  const report=topology.starter.map(tile=>({name:tile.name,coordinate:[tile.x,tile.y],edges:tile.edges.join(''),spec:makeSpec(tile)}));
  const mismatches=topology.validateBoard(topology.starter);
  return {report,mismatches,valid:!mismatches.length};
}
module.exports={makeSpec,rotatedSpec,validate,auditStarter};
