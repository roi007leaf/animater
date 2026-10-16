export const CATALOG_PAGES = ['spells','feats','actions','features','weapons','items','conditions','effects'];
export function worldCatalogSystem(environment={}) {
  return ['pf2e','dnd5e','sf2e','daggerheart'].includes(environment.systemId) ? environment.systemId : environment.demo && !environment.systemId ? 'pf2e' : null;
}
const DAGGERHEART_PAGES={spells:'domain card',weapons:'weapon',conditions:'condition'};
export function catalogNavigation(environment={}) {
  const system=worldCatalogSystem(environment);
  if(!system)return [];
  if(system==='daggerheart')return [['spells','✧','Domain cards'],['weapons','➶','Weapons'],['conditions','◎','Conditions']];
  const label=system==='sf2e'?'SF2e':system==='pf2e'?'PF2e':'D&D 5e';
  return [['spells','✧','spells'],['feats','⚔',system==='dnd5e'?'features':'feats'],...(system==='dnd5e'?[]:[['actions','➤','actions'],['features','✦','features']]),['weapons','➶','weapons'],...(system==='dnd5e'?[['items','◇','items']]:[]),['conditions','◎','conditions'],['effects','◌','effects']].map(([page,icon,name])=>[page,icon,`${label} ${name}`]);
}
// A PF2e world with crossover on borrows these SF2e catalogs, each on its own page.
export const BORROWED_PAGES={'sf2e-spells':'spell','sf2e-feats':'feat','sf2e-actions':'action','sf2e-features':'feature','sf2e-weapons':'weapon'};
export function borrowedNavigation(environment={}) {
  if(environment.systemId!=='pf2e'||environment.crossover!==true)return [];
  return [['sf2e-spells','✧','SF2e spells'],['sf2e-feats','⚔','SF2e feats'],['sf2e-actions','➤','SF2e actions'],['sf2e-features','✦','SF2e features'],['sf2e-weapons','➶','SF2e weapons']];
}
export function catalogPageAllowed(page,environment) {
  if(BORROWED_PAGES[page])return borrowedNavigation(environment).some(([allowed])=>allowed===page);
  return !CATALOG_PAGES.includes(page)||catalogNavigation(environment).some(([allowed])=>allowed===page);
}
export const dndSettingKey=kind=>`dnd5e${kind[0].toUpperCase()+kind.slice(1)}Catalog`;
export const sfSettingKey=kind=>`sf2e${kind[0].toUpperCase()+kind.slice(1)}Catalog`;
export const dhSettingKey=kind=>`daggerheart${kind[0].toUpperCase()+kind.slice(1)}Catalog`;
export function catalogPageTitle(page,environment){
 if(BORROWED_PAGES[page])return `SF2e ${{spell:'spell',feat:'active feat',action:'action',feature:'feature',weapon:'weapon'}[BORROWED_PAGES[page]]} catalog`;
 if(worldCatalogSystem(environment)==='daggerheart'&&CATALOG_PAGES.includes(page))return DAGGERHEART_PAGES[page]?`Daggerheart ${DAGGERHEART_PAGES[page]} catalog`:undefined;
 const system=worldCatalogSystem(environment),kind={spells:'spell',feats:system==='dnd5e'?'active feature':'active feat',actions:system==='dnd5e'?null:'action',features:system==='dnd5e'?null:'feature',weapons:'weapon',items:'activated item',conditions:'condition',effects:'effect'}[page];
 return kind?`${system==='sf2e'?'SF2e':system==='dnd5e'?'D&D 5e':'PF2e'} ${kind} catalog`:{recipes:'Animation recipes',finishers:'Finishers',builder:'Build an animation',assets:'Media library',activity:'Playback activity',setup:'Ready for the table',flash:'Flash screens'}[page];
}
