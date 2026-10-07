export const CATALOG_PAGES = ['spells','feats','weapons','items','conditions','effects'];
export function worldCatalogSystem(environment={}) {
  return ['pf2e','dnd5e','sf2e'].includes(environment.systemId) ? environment.systemId : environment.demo && !environment.systemId ? 'pf2e' : null;
}
export function catalogNavigation(environment={}) {
  const system=worldCatalogSystem(environment);
  if(!system)return [];
  const label=system==='sf2e'?'SF2e':system==='pf2e'?'PF2e':'D&D 5e';
  return [['spells','✧','spells'],['feats','⚔',system==='dnd5e'?'features':'feats'],['weapons','➶','weapons'],...(system==='dnd5e'?[['items','◇','items']]:[]),['conditions','◎','conditions'],['effects','◌','effects']].map(([page,icon,name])=>[page,icon,`${label} ${name}`]);
}
export function catalogPageAllowed(page,environment) {
  return !CATALOG_PAGES.includes(page)||catalogNavigation(environment).some(([allowed])=>allowed===page);
}
export const dndSettingKey=kind=>`dnd5e${kind[0].toUpperCase()+kind.slice(1)}Catalog`;
export const sfSettingKey=kind=>`sf2e${kind[0].toUpperCase()+kind.slice(1)}Catalog`;
export function catalogPageTitle(page,environment){
 const system=worldCatalogSystem(environment),kind={spells:'spell',feats:system==='dnd5e'?'active feature':'active feat',weapons:'weapon',items:'activated item',conditions:'condition',effects:'effect'}[page];
 return kind?`${system==='sf2e'?'SF2e':system==='dnd5e'?'D&D 5e':'PF2e'} ${kind} catalog`:{recipes:'Animation recipes',builder:'Build an animation',assets:'Media library',activity:'Playback activity',setup:'Ready for the table'}[page];
}
