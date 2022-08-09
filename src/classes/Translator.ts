export class Translator extends null {
  static readonly ZShortcut = Object.freeze({
    diep: {
      fact: 'f', 
      random: 'rt', 
      server: 's', 
      tank: 't', 
      wiki: 'w'
    }, 
    music: {
      join: 'j', 
      leave: 'l', 
      play: 'p', 
      playlist: 'pl', 
      remove: 'rm', 
      resend: 'rs'
    }, 
    osu: {
      best: 'bp', 
      user: 'u'
    }
  });

  static getZShortcut([groupName, commandname]: [string, string]): string | void {
    if (!(groupName in this.ZShortcut)) return;
    const nextLayer = this.ZShortcut[groupName as keyof typeof this.ZShortcut];

    if (!(commandname in nextLayer)) return;
    return nextLayer[commandname as keyof typeof nextLayer];
  }

  static getCommandName(zShortcut: string): [string, string] | void {
    for (const groupName in this.ZShortcut) {
      const nextLayer = this.ZShortcut[groupName as keyof typeof this.ZShortcut];
      for (const commandName in nextLayer) {
        if (nextLayer[commandName as keyof typeof nextLayer] === zShortcut) {
          return [groupName, commandName];
        }
      }
    }
  }
}