// Trigger Engine applications that can host the node. Unknown keys are ignored.
const APPLICATIONS = () => [['trigger-animations', 'anim-trigger'], ['trigger-engine', 'pf2e-trigger'], ['trigger-engine', `__${game.system.id}__`]];
// Target entries are { actor, token?: TokenDocument }.
const tokenOf = value => value?.token?.object ?? value?.actor?.getActiveTokens?.()[0] ?? null;

export function createAnimaterPlayNode(Base) {
  return class AnimaterPlayNode extends Base {
    static get type() { return 'animater-play'; }
    static get category() { return 'action'; }
    static get defineInputs() { return [
      { key: 'recipe', type: 'text', label: 'Animater recipe ID or name' },
      { key: 'source', type: 'target', label: 'Source token' },
      { key: 'targets', type: 'target', isArray: true, label: 'Target tokens' }
    ]; }
    get headerColor() { return '#7a4fd0'; }
    get title() { return 'Animater: Play animation'; }
    get subtitle() { return 'Animater recipe'; }
    get icon() { return { unicode: '' }; }
    async _execute() {
      if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) return false;
      const recipe = await this.getInputValue('recipe');
      const source = tokenOf(await this.getInputValue('source'));
      const targets = (await this.getInputValue('targets') ?? []).map(tokenOf).filter(Boolean);
      if (recipe) {
        try { await game.modules.get('animater').api.play(recipe, { source, targets }); }
        catch (error) { console.warn('Animater: Trigger Engine play', error); }
      }
      return this.executeNext('out');
    }
  };
}

export function registerTriggerEngine(hooks = globalThis.Hooks) {
  hooks?.on?.('triggerEngine.registerNodes', register => {
    if (!game.modules.get('trigger-engine')?.active || !globalThis.triggerEngine?.TriggerNode) return;
    const node = createAnimaterPlayNode(globalThis.triggerEngine.TriggerNode);
    for (const [module, app] of APPLICATIONS()) register(module, app, [node]);
  });
}
