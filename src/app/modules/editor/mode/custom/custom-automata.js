export const apply = (CodeMirror) => {
    CodeMirror.defineMode("custom", (config, parserConfig) => {
        var indentUnit = config.indentUnit;
        var isTS = parserConfig.typescript;
        // Indentificar caracteres - \w es igual a [a-zA-Z0-9_]
        var wordRE = parserConfig.wordCharacters || /\w+/;
        const isVariable = /^[a-zA-Z][a-zA-Z0-9_]{0,14}$/;
        const isSuccessDeclare = /declare\s[a-zA-Z][a-zA-Z0-9_]*(\s|)*(,|)(\s|)*([a-zA-Z][a-zA-Z0-9_]*)*\s+(entero|real|cadena)(\s|)*;/;

        var keywords = function () {
            function kw(type) { return { type: type, style: "keyword" }; }
            function operator(type) { return { type: type, style: "operator" }; }
            function startEnd(type) { return { type: type, style: "start-end" }; }
            function types(type) { return { type: type, style: "type" }; }
            var operators = operator("operator");
            var method = kw("method");

            return {
                "Inicio": startEnd("inicio"),
                "declare": operators,
                "si": operators,
                "sino": operators,
                "finsi": operators,
                "entonces": operators,
                "Fin": startEnd("Fin"),
                "envia": method,
                "recibe": method,
                "entero": types("entero"),
                "real": types("real"),
                "cadena": types("cadena")
            };
        }();

        // Método encargado de analizar el contenido
        var type, content;
        function ret(tp, style, cont) {
            type = tp; content = cont;
            return style;
        }

        function tokenString(quote) {
            return function (stream, state) {
                var escaped = false, next;
                while ((next = stream.next()) != null) {
                    if (next == quote && !escaped) break;
                    escaped = !escaped && next == "\\";
                }
                if (!escaped) state.tokenize = tokenBase;
                return ret("string", "string");
            };
        }

        function tokenBase(stream, state) {
            var ch = stream.next();
            if (ch == '"' || ch == "'") {
                state.tokenize = tokenString(ch);
                return state.tokenize(stream, state);
            } else if (ch == "." && stream.match(/^[\d]+/)) { // Punto Decimal
                return ret("number", "number");
            } else if (ch == "#") { // Comentario
                stream.skipToEnd(); // Indica hasta el final
                return ret("comment", "comment")
            } else if (/[,;+\-*&%=<>|^\/\(\)]/.test(ch)) { // Operadores
                return ret("operator", "operator", stream.current());
            } else if (wordRE.test(ch)) { // Letras
                stream.eatWhile(wordRE);
                var word = stream.current();

                if (stream.string) {
                    const linea = stream.string.trim();
                    if (linea.includes("declare") && !isSuccessDeclare.test(linea)) {
                        stream.skipToEnd();
                        return ret("warning", "warning", stream.current());
                    }
                }

                if (keywords.propertyIsEnumerable(word)) { // Palabras reservadas
                    var kw = keywords[word]
                    return ret(kw.type, kw.style, word)
                } else if (isVariable.test(word)) {
                    return ret("variable", "variable", word)
                } else if (/\d/.test(ch)) { // Numero \d es lo mismo que [0-9]
                    return ret("number", "number");
                } else {
                    return ret("warning", "warning", stream.current());
                }
            } else {
                // stream.skipToEnd();
                return ret("error", "error", stream.current());
            }
        }

        // Parser
        function JSLexical(indented, column, type, align, prev, info) {
            this.indented = indented;
            this.column = column;
            this.type = type;
            this.prev = prev;
            this.info = info;
            if (align != null) this.align = align;
        }

        // Validate methods
        function inScope(state, varname) {
            for (var v = state.localVars; v; v = v.next)
                if (v.name == varname) return true;
            for (var cx = state.context; cx; cx = cx.prev) {
                for (var v = cx.vars; v; v = v.next)
                    if (v.name == varname) return true;
            }
        }

        function statement(type, value) {
            return pass(pushlex("stat"), expression, expect(";"), poplex);
        }

        function poplex() {
            var state = cx.state;
            if (state.lexical.prev) {
                if (state.lexical.type == ")")
                    state.indented = state.lexical.indented;
                state.lexical = state.lexical.prev;
            }
        }
        poplex.lex = true;

        function parseJS(state, style, type, content, stream) {
            var cc = state.cc;
            cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc; cx.style = style;

            if (!state.lexical.hasOwnProperty("align"))
                state.lexical.align = true;

            while (true) {
                var combinator = cc.length ? cc.pop() : statement;
                if (combinator(type, content)) {
                    while (cc.length && cc[cc.length - 1].lex)
                        cc.pop()();
                    if (cx.marked) return cx.marked;
                    if (type == "variable" && inScope(state, content)) return "variable-2";
                    return style;
                }
            }
        }

        // Combinator utils

        var cx = { state: null, column: null, marked: null, cc: null };
        function pass() {
            for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
        }
        function cont() {
            pass.apply(null, arguments);
            return true;
        }
        function inList(name, list) {
            for (var v = list; v; v = v.next) if (v.name == name) return true
            return false;
        }
        function register(varname) {
            var state = cx.state;
            cx.marked = "def";
            if (parserConfig.globalVars && !inList(varname, state.globalVars))
                state.globalVars = new Var(varname, state.globalVars)
        }

        function isModifier(name) {
            return name == "public" || name == "private" || name == "protected" || name == "abstract" || name == "readonly"
        }

        // Combinators

        function Context(prev, vars, block) { this.prev = prev; this.vars = vars; this.block = block }
        function Var(name, next) { this.name = name; this.next = next }

        var defaultVars = new Var("this", new Var("arguments", null))
        function pushcontext() {
            cx.state.context = new Context(cx.state.context, cx.state.localVars, false)
            cx.state.localVars = defaultVars
        }
        function popcontext() {
            cx.state.localVars = cx.state.context.vars
            cx.state.context = cx.state.context.prev
        }
        popcontext.lex = true
        function pushlex(type, info) {
            var result = function () {
                var state = cx.state, indent = state.indented;
                if (state.lexical.type == "stat") indent = state.lexical.indented;
                else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
                    indent = outer.indented;
                state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
            };
            result.lex = true;
            return result;
        }


        function expect(wanted) {
            function exp(type) {
                if (type == wanted) return cont();
                else if (wanted == ";" || type == "}" || type == ")" || type == "]") return pass();
                else return cont(exp);
            };
            return exp;
        }
        function expression(type, value) {
            return expressionInner(type, value, false);
        }
        function expressionNoComma(type, value) {
            return expressionInner(type, value, true);
        }
        function expressionInner(type, value, noComma) {
            return cont();
        }


        function quasi(type, value) {
            if (type != "quasi") return pass();
            if (value.slice(value.length - 2) != "${") return cont(quasi);
            return cont(expression, continueQuasi);
        }
        function continueQuasi(type) {
            if (type == "}") {
                cx.marked = "string-2";
                cx.state.tokenize = tokenQuasi;
                return cont(quasi);
            }
        }
        function commasep(what, end, sep) {
            function proceed(type, value) {
                if (sep ? sep.indexOf(type) > -1 : type == ",") {
                    var lex = cx.state.lexical;
                    if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
                    return cont(function (type, value) {
                        if (type == end || value == end) return pass()
                        return pass(what)
                    }, proceed);
                }
                if (type == end || value == end) return cont();
                if (sep && sep.indexOf(";") > -1) return pass(what)
                return cont(expect(end));
            }
            return function (type, value) {
                if (type == end || value == end) return cont();
                return pass(what, proceed);
            };
        }
        function contCommasep(what, end, info) {
            for (var i = 3; i < arguments.length; i++)
                cx.cc.push(arguments[i]);
            return cont(pushlex(end, info), commasep(what, end), poplex);
        }
        function maybetype(type, value) {
            if (isTS) {
                if (type == ":") return cont(typeexpr);
                if (value == "?") return cont(maybetype);
            }
        }
        function maybetypeOrIn(type, value) {
            if (isTS && (type == ":" || value == "in")) return cont(typeexpr)
        }
        function mayberettype(type) {
            if (isTS && type == ":") {
                if (cx.stream.match(/^\s*\w+\s+is\b/, false)) return cont(expression, isKW, typeexpr)
                else return cont(typeexpr)
            }
        }
        function isKW(_, value) {
            if (value == "is") {
                cx.marked = "keyword"
                return cont()
            }
        }
        function typeexpr(type, value) {
            if (value == "keyof" || value == "typeof" || value == "infer" || value == "readonly") {
                cx.marked = "keyword"
                return cont(value == "typeof" ? expressionNoComma : typeexpr)
            }
            if (type == "variable" || value == "void") {
                cx.marked = "type"
                return cont(afterType)
            }
            if (value == "|" || value == "&") return cont(typeexpr)
            if (type == "string" || type == "number" || type == "atom") return cont(afterType);
            if (type == "[") return cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType)
            if (type == "{") return cont(pushlex("}"), typeprops, poplex, afterType)
            if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType, afterType)
            if (type == "<") return cont(commasep(typeexpr, ">"), typeexpr)
        }
        function maybeReturnType(type) {
            if (type == "=>") return cont(typeexpr)
        }
        function typeprops(type) {
            if (type.match(/[\}\)\]]/)) return cont()
            if (type == "," || type == ";") return cont(typeprops)
            return pass(typeprop, typeprops)
        }
        function typeprop(type, value) {
            if (type == "variable" || cx.style == "keyword") {
                cx.marked = "property"
                return cont(typeprop)
            } else if (value == "?" || type == "number" || type == "string") {
                return cont(typeprop)
            } else if (type == ":") {
                return cont(typeexpr)
            } else if (type == "[") {
                return cont(expect("variable"), maybetypeOrIn, expect("]"), typeprop)
            } else if (type == "(") {
                return pass(functiondecl, typeprop)
            } else if (!type.match(/[;\}\)\],]/)) {
                return cont()
            }
        }
        function typearg(type, value) {
            if (type == "variable" && cx.stream.match(/^\s*[?:]/, false) || value == "?") return cont(typearg)
            if (type == ":") return cont(typeexpr)
            if (type == "spread") return cont(typearg)
            return pass(typeexpr)
        }
        function afterType(type, value) {
            if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
            if (value == "|" || type == "." || value == "&") return cont(typeexpr)
            if (type == "[") return cont(typeexpr, expect("]"), afterType)
            if (value == "extends" || value == "implements") { cx.marked = "keyword"; return cont(typeexpr) }
            if (value == "?") return cont(typeexpr, expect(":"), typeexpr)
        }
        function typeparam() {
            return pass(typeexpr, maybeTypeDefault)
        }
        function maybeTypeDefault(_, value) {
            if (value == "=") return cont(typeexpr)
        }
        function vardef(_, value) {
            if (value == "enum") { cx.marked = "keyword"; return cont(enumdef) }
            return pass(pattern, maybetype, maybeAssign, vardefCont);
        }
        function pattern(type, value) {
            if (isTS && isModifier(value)) { cx.marked = "keyword"; return cont(pattern) }
            if (type == "variable") { register(value); return cont(); }
            if (type == "spread") return cont(pattern);
            if (type == "[") return contCommasep(eltpattern, "]");
            if (type == "{") return contCommasep(proppattern, "}");
        }
        function proppattern(type, value) {
            if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
                register(value);
                return cont(maybeAssign);
            }
            if (type == "variable") cx.marked = "property";
            if (type == "spread") return cont(pattern);
            if (type == "}") return pass();
            if (type == "[") return cont(expression, expect(']'), expect(':'), proppattern);
            return cont(expect(":"), pattern, maybeAssign);
        }
        function eltpattern() {
            return pass(pattern, maybeAssign)
        }
        function maybeAssign(_type, value) {
            if (value == "=") return cont(expressionNoComma);
        }
        function vardefCont(type) {
            if (type == ",") return cont(vardef);
        }
        function functiondecl(type, value) {
            if (value == "*") { cx.marked = "keyword"; return cont(functiondecl); }
            if (type == "variable") { register(value); return cont(functiondecl); }
            if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, popcontext);
            if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondecl)
        }
        function funarg(type, value) {
            if (value == "@") cont(expression, funarg)
            if (type == "spread") return cont(funarg);
            if (isTS && isModifier(value)) { cx.marked = "keyword"; return cont(funarg); }
            if (isTS && type == "this") return cont(maybetype, maybeAssign)
            return pass(pattern, maybetype, maybeAssign);
        }
        function importSpec(type, value) {
            if (type == "{") return contCommasep(importSpec, "}");
            if (type == "variable") register(value);
            if (value == "*") cx.marked = "keyword";
            return cont(maybeAs);
        }
        function maybeAs(_type, value) {
            if (value == "as") { cx.marked = "keyword"; return cont(importSpec); }
        }
        function enumdef() {
            return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
        }
        function enummember() {
            return pass(pattern, maybeAssign);
        }

        // Metodos requeridos
        function tokenComment(stream, state) {
            var maybeEnd = false, ch;
            while (ch = stream.next()) {
                if (ch == "#" && maybeEnd) {
                    state.tokenize = tokenBase;
                    break;
                }
                maybeEnd = (ch == "*");
            }
            return ret("comment", "comment");
        }

        // Configuración
        return {
            startState: function (basecolumn) {
                var state = {
                    tokenize: tokenBase,
                    lastType: "sof",
                    cc: [],
                    lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
                    localVars: parserConfig.localVars,
                    context: parserConfig.localVars && new Context(null, null, false),
                    indented: basecolumn || 0
                };
                if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
                    state.globalVars = parserConfig.globalVars;
                return state;
            },
            token: function (stream, state) {
                if (state.tokenize != tokenComment && stream.eatSpace()) return null;
                var style = state.tokenize(stream, state);
                if (type == "comment") return style;
                state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
                return parseJS(state, style, type, content, stream);
            },
            lineComment: "#",
            closeBrackets: "()[]{}''\"\"``"
        };
    });
}