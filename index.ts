import default_binding from './default.json' with { type: "json" };


type Key = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" |
    "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" |
    "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" |
    "alt" | "ctrl" | "shift" | "space" | "tab" | "enter" | "backspace" | "win" |
    "oem_comma" | "oem_minus" | "oem_period" | "oem_plus" |
    // JIS配列の場合 oem_1: ':' oem_2: '/' oem_3: '@' oem_4: '[' oem_5: '¥' oem_6: ']' oem_7:'^' oem_102: '\'
    "oem_1" | "oem_2" | "oem_3" | "oem_4" | "oem_5" | "oem_6" | "oem_7" | "oem_102" |
    "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12" |
    "left" | "right" | "up" | "down" | "home" | "end" | "pageup" | "pagedown" |
    "delete" | "escape" | "insert" |
    "numpad0" | "numpad_add" | "numpad_subtract" | "browserback" | "browserforward";

type Keys = Set<Key>;

type KeyStroke = [Keys] | [Keys, Keys];

type KeyBinding = {
    key: KeyStroke;
    command: string;
    when?: string;
    args?: Record<string, any>;
};

function isInclude(source: Keys, target: Keys): boolean {
    return [...target].every(key => source.has(key));
}

function equalKeys(a: Keys, b: Keys): boolean {
    return a.size === b.size && isInclude(a, b);
}

function equalstroke(a: KeyStroke, b: KeyStroke): boolean {
    if (a.length !== b.length) return false;
    return a.reduce((acc, cur, index) => (equalKeys(cur, b[index]) && acc), true);
}

function replaceKeyStroke<T extends KeyStroke>(source: T, target: Keys, replacement: Keys): T {
    return source.map(key => replaceKeys(key, target, replacement)) as T;
}

function replaceKeys(source: Keys, target: Keys, replacement: Keys): Keys {
    if (!isInclude(source, target)) return source;
    return new Set([...[...source].filter(key => !target.has(key)), ...replacement]);
}

function keystrokestring(keyStroke: KeyStroke): string {
    return keyStroke.map(keys => Array.from(keys).join('+')).join(' ');
}

function toJson(keyBinding: KeyBinding[]): string {
    return JSON.stringify(keyBinding.map(binding => ({
        ...binding,
        key: keystrokestring(binding.key)
    })), null, 2);
}

function addLeader(binding: KeyBinding): KeyBinding {
    if (binding.key.length == 2) {console.dir(binding); throw new Error("2 stroke can't add Leader.");}
    return {
        ...binding,
        key: [new Set(['ctrl','oem_7']), binding.key[0]]
    };
}

const defaultKeyBinding: KeyBinding[] = default_binding.map(binding => {
    return { ...binding, key: binding.key.split(' ').map(k => new Set(k.split('+'))) as KeyStroke }
});

const general_replacements: [Key, Keys][] = [
    ['left', new Set(['alt', 'h'])],
    ['right', new Set(['alt', 'l'])],
    ['up', new Set(['alt', 'k'])],
    ['down', new Set(['alt', 'j'])],
    ['pageup', new Set(['alt', 'w'])],
    ['pagedown', new Set(['alt', 's'])],
    ['home', new Set(['alt', 'a'])],
    ['end', new Set(['alt', 'd'])],
    ['escape', new Set(['ctrl', 'oem_102'])],
    ['delete', new Set(['shift', 'backspace'])],
    ['insert', new Set(['alt', 'oem_5'])],
    ['f1', new Set(['alt', '1'])],
    ['f2', new Set(['alt', '2'])],
    ['f3', new Set(['alt', '3'])],
    ['f4', new Set(['alt', '4'])],
    ['f5', new Set(['alt', '5'])],
    ['f6', new Set(['alt', '6'])],
    ['f7', new Set(['alt', '7'])],
    ['f8', new Set(['alt', '8'])],
    ['f9', new Set(['alt', '9'])],
    ['f10', new Set(['alt', '0'])],
    ['f11', new Set(['alt', 'oem_minus'])],
    ['f12', new Set(['alt', 'oem_7'])],
];

const ctrlk_replacements: [Keys, Keys][] = [
    [new Set(['ctrl', 'alt', 'down']), new Set(['ctrl', 'alt','j'])],
    [new Set(['ctrl', 'down']), new Set(['alt', 'j'])],
    [new Set(['down']), new Set(['j'])],
    [new Set(['ctrl', 'pagedown']), new Set(['shift', 'alt','j'])],
    [new Set(['ctrl', 'alt', 'up']), new Set(['ctrl', 'alt','k'])],
    [new Set(['ctrl', 'up']), new Set(['alt', 'k'])],
    [new Set(['up']), new Set(['k'])],
    [new Set(['ctrl', 'pageup']), new Set(['shift', 'alt','k'])],
    [new Set(['left']), new Set(['h'])],
    [new Set(['right']), new Set(['l'])],
];

const special_replacements: [[Keys,Keys], KeyStroke][] = [
    [[new Set<Key>(['alt','home']), new Set<Key>(['alt','home'])], [new Set(['ctrl','oem_7']), new Set(['alt','a'])]],
    [[new Set<Key>(['alt','end']), new Set<Key>(['alt','end'])], [new Set(['ctrl','oem_7']), new Set(['alt','d'])]],
];

const [special_binding, ctrlk_binding, other_binding] = defaultKeyBinding.reduce<[KeyBinding[], KeyBinding[], KeyBinding[]]>((acc, binding) => {
    if (special_replacements.some(x => equalstroke(x[0], binding.key))) {
        acc[0].push(binding);
    } else if (equalKeys(binding.key[0], new Set<Key>(['ctrl','k']))) {
        acc[1].push(binding);
    } else {
        acc[2].push(binding);
    }
    return acc;
}, [[], [], []]);

const special_replaced_binding :KeyBinding[]= special_binding.flatMap(binding => {
    const replacement = special_replacements.find(x => equalstroke(x[0], binding.key));
    if (replacement) {
        return [{ ...binding, key: replacement[1] }];
    } else {
        return [];
    }
    
});
const ctrlk_replaced_binding: KeyBinding[] = ctrlk_binding.flatMap(binding => (
    ctrlk_replacements.filter(x => equalKeys(x[0], binding.key[1] as Keys)).map(x => (
        { ...binding, key: [binding.key[0], x[1]] }
    ))
));

const replaced = other_binding.flatMap(binding => (
    general_replacements.flatMap(x => {
        const try_replace = replaceKeyStroke(binding.key, new Set([x[0]]), x[1])
        if (equalstroke(try_replace, binding.key)) return [];
        if ([...binding.key[0]].filter(key => x[1].has(key)).length != 0) return [addLeader({...binding, key: try_replace})]
        return [{ ...binding, key: try_replace }];
    })
));

const replaced_batting = other_binding.flatMap(binding => {
    const batting = replaced.find(x => equalstroke(x.key, binding.key));
    if (batting) {
        return [addLeader(batting)];
    }
    return [];
});

console.dir(toJson([...special_replaced_binding, ...ctrlk_replaced_binding, ...replaced, ...replaced_batting]));