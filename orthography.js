const ORTHOGRAPHY_RULES = [
    [/^(.*[aeiou]c) \^ ly$/, "$1ally"],
    [/^(.+[aeioubmnp])le \^ ly$/, "$1ly"],
    [/^(.*t)e \^ (ry|ary)$/, "$1ory"],
    [/^(.+)m \^ tor(y|ily)$/, "$1mator$2"],
    [/^(.+)se \^ ar(y|ies)$/, "$1sor$2"],
    [/^(.*[naeiou])te? \^ cy$/, "$1cy"],
    [/^(.*(?:s|sh|x|z|zh)) \^ s$/, "$1es"],
    [/^(.*(?:oa|ea|i|ee|oo|au|ou|l|n|(?<![gin]a)r|t)ch) \^ s$/, "$1es"],
    [/^(.+[bcdfghjklmnpqrstvwxz])y \^ s$/, "$1ies"],
    [/^(.+)ie \^ ing$/, "$1ying"],
    [/^(.+[cdfghlmnpr])y \^ ist$/, "$1ist"],
    [/^(.+[bcdfghjklmnpqrstvwxz])y \^ ([a-hj-xz].*)$/, "$1i$2"],
    [/^(.+)te \^ en$/, "$1tten"],
    [/^(.+[ae]) \^ e(n|ns)$/, "$1$2"],
    [/^(.+)y \^ (ial|ially)$/, "$1$2"],
    [/^(.+)i \^ if(y|ying|ied|ies|ication|ications)$/, "$1if$2"],
    [/^(.+)ic \^ (ical|ically)$/, "$1$2"],
    [/^(.+)ology \^ ic(al|ally)$/, "$1ologic$2"],
    [/^(.*)ry \^ ica(l|lly|lity)$/, "$1rica$2"],
    [/^(.*[l]) \^ is(t|ts)$/, "$1is$2"],
    [/^(.*)ry \^ ity$/, "$1rity"],
    [/^(.*)l \^ ity$/, "$1lity"],
    [/^(.+)rm \^ tiv(e|ity|ities)$/, "$1rmativ$2"],
    [/^(.+)e \^ tiv(e|ity|ities)$/, "$1ativ$2"],
    [/^(.+)y \^ iz(e|es|ing|ed|er|ers|ation|ations|able|ability)$/, "$1iz$2"],
    [/^(.+)y \^ is(e|es|ing|ed|er|ers|ation|ations|able|ability)$/, "$1is$2"],
    [/^(.+)al \^ iz(e|ed|es|ing|er|ers|ation|ations|m|ms|able|ability|abilities)$/, "$1aliz$2"],
    [/^(.+)al \^ is(e|ed|es|ing|er|ers|ation|ations|m|ms|able|ability|abilities)$/, "$1alis$2"],
    [/^(.+)ar \^ iz(e|ed|es|ing|er|ers|ation|ations|m|ms)$/, "$1ariz$2"],
    [/^(.+)ar \^ is(e|ed|es|ing|er|ers|ation|ations|m|ms)$/, "$1aris$2"],
    [/^(.*[lmnty]) \^ iz(e|es|ing|ed|er|ers|ation|ations|m|ms|able|ability|abilities)$/, "$1iz$2"],
    [/^(.*[lmnty]) \^ is(e|es|ing|ed|er|ers|ation|ations|m|ms|able|ability|abilities)$/, "$1is$2"],
    [/^(.+)al \^ olog(y|ist|ists|ical|ically)$/, "$1olog$2"],
    [/^(.+)(ar|er|or) \^ ish$/, "$1$2ish"],
    [/^(.+e)e \^ (e.+)$/, "$1$2"],
    [/^(.+[bcdfghjklmnpqrstuvwxz])e \^ ([aeiouy].*)$/, "$1$2"],
    [/^(.*(?:[bcdfghjklmnprstvwxyz]|qu)[aeiou])([bcfgdklmnprtvz]) \^ ([aeiouy].*)$/, "$1$2$2$3"],
]

function apply_orthography(word, suffix) {
    let join = word + suffix;
    if (ENGLISH_DICTIONARY.has(join)) {
        return join;
    }
    let ortho_match = word + " ^ " + suffix;
    for (let i = 0; i < ORTHOGRAPHY_RULES.length; i++) {
        let m = ortho_match.match(ORTHOGRAPHY_RULES[i][0]);
        if (m) {
            return ortho_match.replace(...ORTHOGRAPHY_RULES[i]);
        }
    }
    return join;
}