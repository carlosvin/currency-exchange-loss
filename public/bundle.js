
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Header.svelte generated by Svelte v3.12.1 */

    const file = "src/Header.svelte";

    function create_fragment(ctx) {
    	var header, h1, t;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			t = text(ctx.title);
    			add_location(h1, file, 17, 4, 266);
    			attr_dev(header, "class", "svelte-1d27zk1");
    			add_location(header, file, 16, 0, 253);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data_dev(t, ctx.title);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(header);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { title } = $$props;

    	const writable_props = ['title'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    	};

    	$$self.$capture_state = () => {
    		return { title };
    	};

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    	};

    	return { title };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["title"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.title === undefined && !('title' in props)) {
    			console.warn("<Header> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Fetch.svelte generated by Svelte v3.12.1 */
    const { Error: Error_1, Object: Object_1 } = globals;

    const get_default_slot_changes = ({ data }) => ({ data: data });
    const get_default_slot_context = ({ data }) => ({ data: data });

    function create_fragment$1(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.data)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { baseUrl, params = {} } = $$props;
        let data;
        
    	const dispatch = createEventDispatcher();

        function getUrl () {
            if (baseUrl) {
                const url = new URL(baseUrl);
                Object
                    .keys(params)
                    .forEach(
                        key => url.searchParams.append(key, params[key]));
                return url.toString();
            }
            return undefined;
        }

        onMount (async function () {
            const url = getUrl();
            if (url) {
                let response = await fetch(url, {method: 'GET' });
                if (response.ok) {
                    $$invalidate('data', data = await response.json());
                    dispatch('data', data);
                } else {
                    throw new Error(`Error fetching ${url} > ${response.status}`);
                }
            }
        });

    	const writable_props = ['baseUrl', 'params'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Fetch> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('baseUrl' in $$props) $$invalidate('baseUrl', baseUrl = $$props.baseUrl);
    		if ('params' in $$props) $$invalidate('params', params = $$props.params);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { baseUrl, params, data };
    	};

    	$$self.$inject_state = $$props => {
    		if ('baseUrl' in $$props) $$invalidate('baseUrl', baseUrl = $$props.baseUrl);
    		if ('params' in $$props) $$invalidate('params', params = $$props.params);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    	};

    	return { baseUrl, params, data, $$slots, $$scope };
    }

    class Fetch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["baseUrl", "params"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Fetch", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.baseUrl === undefined && !('baseUrl' in props)) {
    			console.warn("<Fetch> was created without expected prop 'baseUrl'");
    		}
    	}

    	get baseUrl() {
    		throw new Error_1("<Fetch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseUrl(value) {
    		throw new Error_1("<Fetch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get params() {
    		throw new Error_1("<Fetch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error_1("<Fetch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const KEY = 'rates';

    function readRates () {
        const savedRatesString = localStorage.getItem(KEY);
        return savedRatesString ? JSON.parse(savedRatesString) : {};
    }

    function writeRates (rates) {
        localStorage.setItem(KEY, JSON.stringify(rates));
    }

    /* src/FetchRates.svelte generated by Svelte v3.12.1 */

    const get_default_slot_changes$1 = ({ rates }) => ({ rates: rates });
    const get_default_slot_context$1 = ({ rates }) => ({ rates: rates });

    // (17:0) {#if baseCurrency && targetCurrencies}
    function create_if_block(ctx) {
    	var current;

    	var fetch = new Fetch({
    		props: {
    		params: { 
                base: ctx.baseCurrency, 
                target: Array.from(ctx.targetCurrencies).join(','),
                apikey: 'T0272d9a397f6cf710dd40c09df0626c'},
    		baseUrl: "https://api.currencystack.io/currency",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	fetch.$on("data", ctx.handleData);

    	const block = {
    		c: function create() {
    			fetch.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(fetch, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var fetch_changes = {};
    			if (changed.baseCurrency || changed.targetCurrencies) fetch_changes.params = { 
                base: ctx.baseCurrency, 
                target: Array.from(ctx.targetCurrencies).join(','),
                apikey: 'T0272d9a397f6cf710dd40c09df0626c'};
    			if (changed.$$scope || changed.rates) fetch_changes.$$scope = { changed, ctx };
    			fetch.$set(fetch_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(fetch.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(fetch.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(fetch, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(17:0) {#if baseCurrency && targetCurrencies}", ctx });
    	return block;
    }

    // (18:4) <Fetch          params={{              base: baseCurrency,              target: Array.from(targetCurrencies).join(','),             apikey: 'T0272d9a397f6cf710dd40c09df0626c'}}         baseUrl='https://api.currencystack.io/currency'          on:data={handleData}>
    function create_default_slot(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.rates)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes$1),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context$1)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(18:4) <Fetch          params={{              base: baseCurrency,              target: Array.from(targetCurrencies).join(','),             apikey: 'T0272d9a397f6cf710dd40c09df0626c'}}         baseUrl='https://api.currencystack.io/currency'          on:data={handleData}>", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.baseCurrency && ctx.targetCurrencies) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.baseCurrency && ctx.targetCurrencies) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

        let rates = readRates();
        let { baseCurrency, targetCurrencies } = $$props;

        function handleData (data) {
            if (data && data.detail.rates) {
                $$invalidate('rates', rates = data.detail.rates);
                writeRates(rates);
            }
        }

    	const writable_props = ['baseCurrency', 'targetCurrencies'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<FetchRates> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('baseCurrency' in $$props) $$invalidate('baseCurrency', baseCurrency = $$props.baseCurrency);
    		if ('targetCurrencies' in $$props) $$invalidate('targetCurrencies', targetCurrencies = $$props.targetCurrencies);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { rates, baseCurrency, targetCurrencies };
    	};

    	$$self.$inject_state = $$props => {
    		if ('rates' in $$props) $$invalidate('rates', rates = $$props.rates);
    		if ('baseCurrency' in $$props) $$invalidate('baseCurrency', baseCurrency = $$props.baseCurrency);
    		if ('targetCurrencies' in $$props) $$invalidate('targetCurrencies', targetCurrencies = $$props.targetCurrencies);
    	};

    	return {
    		rates,
    		baseCurrency,
    		targetCurrencies,
    		handleData,
    		$$slots,
    		$$scope
    	};
    }

    class FetchRates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["baseCurrency", "targetCurrencies"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "FetchRates", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.baseCurrency === undefined && !('baseCurrency' in props)) {
    			console.warn("<FetchRates> was created without expected prop 'baseCurrency'");
    		}
    		if (ctx.targetCurrencies === undefined && !('targetCurrencies' in props)) {
    			console.warn("<FetchRates> was created without expected prop 'targetCurrencies'");
    		}
    	}

    	get baseCurrency() {
    		throw new Error("<FetchRates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseCurrency(value) {
    		throw new Error("<FetchRates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get targetCurrencies() {
    		throw new Error("<FetchRates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set targetCurrencies(value) {
    		throw new Error("<FetchRates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const currencies = {
        "AED": "United Arab Emirates Dirham",
        "AFN": "Afghan Afghani",
        "ALL": "Albanian Lek",
        "AMD": "Armenian Dram",
        "ANG": "Netherlands Antillean Guilder",
        "AOA": "Angolan Kwanza",
        "ARS": "Argentine Peso",
        "AUD": "Australian Dollar",
        "AWG": "Aruban Florin",
        "AZN": "Azerbaijani Manat",
        "BAM": "Bosnia-Herzegovina Convertible Mark",
        "BBD": "Barbadian Dollar",
        "BDT": "Bangladeshi Taka",
        "BGN": "Bulgarian Lev",
        "BHD": "Bahraini Dinar",
        "BIF": "Burundian Franc",
        "BMD": "Bermudan Dollar",
        "BND": "Brunei Dollar",
        "BOB": "Bolivian Boliviano",
        "BRL": "Brazilian Real",
        "BSD": "Bahamian Dollar",
        "BTC": "Bitcoin",
        "BTN": "Bhutanese Ngultrum",
        "BWP": "Botswanan Pula",
        "BYN": "Belarusian Ruble",
        "BZD": "Belize Dollar",
        "CAD": "Canadian Dollar",
        "CDF": "Congolese Franc",
        "CHF": "Swiss Franc",
        "CLF": "Chilean Unit of Account (UF)",
        "CLP": "Chilean Peso",
        "CNH": "Chinese Yuan (Offshore)",
        "CNY": "Chinese Yuan",
        "COP": "Colombian Peso",
        "CRC": "Costa Rican Colón",
        "CUC": "Cuban Convertible Peso",
        "CUP": "Cuban Peso",
        "CVE": "Cape Verdean Escudo",
        "CZK": "Czech Republic Koruna",
        "DJF": "Djiboutian Franc",
        "DKK": "Danish Krone",
        "DOP": "Dominican Peso",
        "DZD": "Algerian Dinar",
        "EGP": "Egyptian Pound",
        "ERN": "Eritrean Nakfa",
        "ETB": "Ethiopian Birr",
        "EUR": "Euro",
        "FJD": "Fijian Dollar",
        "FKP": "Falkland Islands Pound",
        "GBP": "British Pound Sterling",
        "GEL": "Georgian Lari",
        "GGP": "Guernsey Pound",
        "GHS": "Ghanaian Cedi",
        "GIP": "Gibraltar Pound",
        "GMD": "Gambian Dalasi",
        "GNF": "Guinean Franc",
        "GTQ": "Guatemalan Quetzal",
        "GYD": "Guyanaese Dollar",
        "HKD": "Hong Kong Dollar",
        "HNL": "Honduran Lempira",
        "HRK": "Croatian Kuna",
        "HTG": "Haitian Gourde",
        "HUF": "Hungarian Forint",
        "IDR": "Indonesian Rupiah",
        "ILS": "Israeli New Sheqel",
        "IMP": "Manx pound",
        "INR": "Indian Rupee",
        "IQD": "Iraqi Dinar",
        "IRR": "Iranian Rial",
        "ISK": "Icelandic Króna",
        "JEP": "Jersey Pound",
        "JMD": "Jamaican Dollar",
        "JOD": "Jordanian Dinar",
        "JPY": "Japanese Yen",
        "KES": "Kenyan Shilling",
        "KGS": "Kyrgystani Som",
        "KHR": "Cambodian Riel",
        "KMF": "Comorian Franc",
        "KPW": "North Korean Won",
        "KRW": "South Korean Won",
        "KWD": "Kuwaiti Dinar",
        "KYD": "Cayman Islands Dollar",
        "KZT": "Kazakhstani Tenge",
        "LAK": "Laotian Kip",
        "LBP": "Lebanese Pound",
        "LKR": "Sri Lankan Rupee",
        "LRD": "Liberian Dollar",
        "LSL": "Lesotho Loti",
        "LYD": "Libyan Dinar",
        "MAD": "Moroccan Dirham",
        "MDL": "Moldovan Leu",
        "MGA": "Malagasy Ariary",
        "MKD": "Macedonian Denar",
        "MMK": "Myanma Kyat",
        "MNT": "Mongolian Tugrik",
        "MOP": "Macanese Pataca",
        "MRO": "Mauritanian Ouguiya (pre-2018)",
        "MRU": "Mauritanian Ouguiya",
        "MUR": "Mauritian Rupee",
        "MVR": "Maldivian Rufiyaa",
        "MWK": "Malawian Kwacha",
        "MXN": "Mexican Peso",
        "MYR": "Malaysian Ringgit",
        "MZN": "Mozambican Metical",
        "NAD": "Namibian Dollar",
        "NGN": "Nigerian Naira",
        "NIO": "Nicaraguan Córdoba",
        "NOK": "Norwegian Krone",
        "NPR": "Nepalese Rupee",
        "NZD": "New Zealand Dollar",
        "OMR": "Omani Rial",
        "PAB": "Panamanian Balboa",
        "PEN": "Peruvian Nuevo Sol",
        "PGK": "Papua New Guinean Kina",
        "PHP": "Philippine Peso",
        "PKR": "Pakistani Rupee",
        "PLN": "Polish Zloty",
        "PYG": "Paraguayan Guarani",
        "QAR": "Qatari Rial",
        "RON": "Romanian Leu",
        "RSD": "Serbian Dinar",
        "RUB": "Russian Ruble",
        "RWF": "Rwandan Franc",
        "SAR": "Saudi Riyal",
        "SBD": "Solomon Islands Dollar",
        "SCR": "Seychellois Rupee",
        "SDG": "Sudanese Pound",
        "SEK": "Swedish Krona",
        "SGD": "Singapore Dollar",
        "SHP": "Saint Helena Pound",
        "SLL": "Sierra Leonean Leone",
        "SOS": "Somali Shilling",
        "SRD": "Surinamese Dollar",
        "SSP": "South Sudanese Pound",
        "STD": "São Tomé and Príncipe Dobra (pre-2018)",
        "STN": "São Tomé and Príncipe Dobra",
        "SVC": "Salvadoran Colón",
        "SYP": "Syrian Pound",
        "SZL": "Swazi Lilangeni",
        "THB": "Thai Baht",
        "TJS": "Tajikistani Somoni",
        "TMT": "Turkmenistani Manat",
        "TND": "Tunisian Dinar",
        "TOP": "Tongan Pa'anga",
        "TRY": "Turkish Lira",
        "TTD": "Trinidad and Tobago Dollar",
        "TWD": "New Taiwan Dollar",
        "TZS": "Tanzanian Shilling",
        "UAH": "Ukrainian Hryvnia",
        "UGX": "Ugandan Shilling",
        "USD": "United States Dollar",
        "UYU": "Uruguayan Peso",
        "UZS": "Uzbekistan Som",
        "VEF": "Venezuelan Bolívar Fuerte",
        "VND": "Vietnamese Dong",
        "VUV": "Vanuatu Vatu",
        "WST": "Samoan Tala",
        "XAF": "CFA Franc BEAC",
        "XAG": "Silver Ounce",
        "XAU": "Gold Ounce",
        "XCD": "East Caribbean Dollar",
        "XDR": "Special Drawing Rights",
        "XOF": "CFA Franc BCEAO",
        "XPD": "Palladium Ounce",
        "XPF": "CFP Franc",
        "XPT": "Platinum Ounce",
        "YER": "Yemeni Rial",
        "ZAR": "South African Rand",
        "ZMW": "Zambian Kwacha",
        "ZWL": "Zimbabwean Dollar"
    };

    /* src/SelectCurrencies.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/SelectCurrencies.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.code = list[i][0];
    	child_ctx.name = list[i][1];
    	return child_ctx;
    }

    // (13:0) {:else}
    function create_else_block(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$1, 13, 4, 284);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(13:0) {:else}", ctx });
    	return block;
    }

    // (7:0) {#if currencies}
    function create_if_block$1(ctx) {
    	var select, dispose;

    	let each_value = Object.entries(ctx.currencies);

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			if (ctx.selected === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			add_location(select, file$1, 7, 4, 102);
    			dispose = listen_dev(select, "change", ctx.select_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.selected);
    		},

    		p: function update(changed, ctx) {
    			if (changed.currencies) {
    				each_value = Object.entries(ctx.currencies);

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.selected) select_option(select, ctx.selected);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(select);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(7:0) {#if currencies}", ctx });
    	return block;
    }

    // (9:8) {#each Object.entries(currencies) as [code, name]}
    function create_each_block(ctx) {
    	var option, t_value = ctx.name + "", t, option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.code;
    			option.value = option.__value;
    			add_location(option, file$1, 9, 12, 204);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currencies) && t_value !== (t_value = ctx.name + "")) {
    				set_data_dev(t, t_value);
    			}

    			if ((changed.currencies) && option_value_value !== (option_value_value = ctx.code)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(9:8) {#each Object.entries(currencies) as [code, name]}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var if_block_anchor;

    	function select_block_type(changed, ctx) {
    		if (ctx.currencies) return create_if_block$1;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { currencies, selected = 'EUR' } = $$props;

    	const writable_props = ['currencies', 'selected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SelectCurrencies> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate('selected', selected);
    		$$invalidate('currencies', currencies);
    	}

    	$$self.$set = $$props => {
    		if ('currencies' in $$props) $$invalidate('currencies', currencies = $$props.currencies);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	$$self.$capture_state = () => {
    		return { currencies, selected };
    	};

    	$$self.$inject_state = $$props => {
    		if ('currencies' in $$props) $$invalidate('currencies', currencies = $$props.currencies);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	return {
    		currencies,
    		selected,
    		select_change_handler
    	};
    }

    class SelectCurrencies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["currencies", "selected"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SelectCurrencies", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.currencies === undefined && !('currencies' in props)) {
    			console.warn("<SelectCurrencies> was created without expected prop 'currencies'");
    		}
    	}

    	get currencies() {
    		throw new Error("<SelectCurrencies>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currencies(value) {
    		throw new Error("<SelectCurrencies>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<SelectCurrencies>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<SelectCurrencies>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/App.svelte";

    // (28:1) {#if currencies}
    function create_if_block$2(ctx) {
    	var updating_selected, t0, updating_selected_1, t1, input, input_updating = false, t2, if_block_anchor, current, dispose;

    	function selectcurrencies0_selected_binding(value) {
    		ctx.selectcurrencies0_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let selectcurrencies0_props = { currencies: currencies };
    	if (ctx.selectedFrom !== void 0) {
    		selectcurrencies0_props.selected = ctx.selectedFrom;
    	}
    	var selectcurrencies0 = new SelectCurrencies({
    		props: selectcurrencies0_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(selectcurrencies0, 'selected', selectcurrencies0_selected_binding));

    	function selectcurrencies1_selected_binding(value_1) {
    		ctx.selectcurrencies1_selected_binding.call(null, value_1);
    		updating_selected_1 = true;
    		add_flush_callback(() => updating_selected_1 = false);
    	}

    	let selectcurrencies1_props = { currencies: currencies };
    	if (ctx.selectedTo !== void 0) {
    		selectcurrencies1_props.selected = ctx.selectedTo;
    	}
    	var selectcurrencies1 = new SelectCurrencies({
    		props: selectcurrencies1_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(selectcurrencies1, 'selected', selectcurrencies1_selected_binding));

    	function input_input_handler() {
    		input_updating = true;
    		ctx.input_input_handler.call(input);
    	}

    	var if_block = (ctx.selectedFrom && ctx.selectedFrom !== ctx.selectedTo) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			selectcurrencies0.$$.fragment.c();
    			t0 = space();
    			selectcurrencies1.$$.fragment.c();
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "placeholder", "Rate offered");
    			add_location(input, file$2, 30, 2, 610);
    			dispose = listen_dev(input, "input", input_input_handler);
    		},

    		m: function mount(target, anchor) {
    			mount_component(selectcurrencies0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(selectcurrencies1, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.rateOffered);

    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var selectcurrencies0_changes = {};
    			if (!updating_selected && changed.selectedFrom) {
    				selectcurrencies0_changes.selected = ctx.selectedFrom;
    			}
    			selectcurrencies0.$set(selectcurrencies0_changes);

    			var selectcurrencies1_changes = {};
    			if (!updating_selected_1 && changed.selectedTo) {
    				selectcurrencies1_changes.selected = ctx.selectedTo;
    			}
    			selectcurrencies1.$set(selectcurrencies1_changes);

    			if (!input_updating && changed.rateOffered) set_input_value(input, ctx.rateOffered);
    			input_updating = false;

    			if (ctx.selectedFrom && ctx.selectedFrom !== ctx.selectedTo) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectcurrencies0.$$.fragment, local);

    			transition_in(selectcurrencies1.$$.fragment, local);

    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(selectcurrencies0.$$.fragment, local);
    			transition_out(selectcurrencies1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(selectcurrencies0, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(selectcurrencies1, detaching);

    			if (detaching) {
    				detach_dev(t1);
    				detach_dev(input);
    				detach_dev(t2);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(28:1) {#if currencies}", ctx });
    	return block;
    }

    // (32:2) {#if selectedFrom && selectedFrom !== selectedTo}
    function create_if_block_1(ctx) {
    	var current;

    	var fetchrates = new FetchRates({
    		props: {
    		baseCurrency: ctx.selectedFrom,
    		targetCurrencies: Object.keys(currencies),
    		$$slots: {
    		default: [create_default_slot$1, ({ rates }) => ({ rates })]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			fetchrates.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(fetchrates, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var fetchrates_changes = {};
    			if (changed.selectedFrom) fetchrates_changes.baseCurrency = ctx.selectedFrom;
    			if (changed.$$scope || changed.selectedTo || changed.amountToChange || changed.rateOffered || changed.selectedFrom) fetchrates_changes.$$scope = { changed, ctx };
    			fetchrates.$set(fetchrates_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(fetchrates.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(fetchrates.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(fetchrates, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(32:2) {#if selectedFrom && selectedFrom !== selectedTo}", ctx });
    	return block;
    }

    // (36:4) {#if amountToChange}
    function create_if_block_2(ctx) {
    	var p, t0, t1_value = ctx.rates[ctx.selectedTo] * ctx.amountToChange + "", t1, t2, t3, t4, if_block_anchor;

    	var if_block = (ctx.rateOffered) && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Expected amount: ");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(ctx.selectedTo);
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(p, file$2, 36, 4, 969);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.rates || changed.selectedTo || changed.amountToChange) && t1_value !== (t1_value = ctx.rates[ctx.selectedTo] * ctx.amountToChange + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if (changed.selectedTo) {
    				set_data_dev(t3, ctx.selectedTo);
    			}

    			if (ctx.rateOffered) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t4);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(36:4) {#if amountToChange}", ctx });
    	return block;
    }

    // (38:5) {#if rateOffered}
    function create_if_block_3(ctx) {
    	var p0, t0, t1_value = ctx.rateOffered * ctx.amountToChange + "", t1, t2, t3, t4, p1, t5, t6_value = (ctx.rates[ctx.selectedTo] - ctx.rateOffered) * ctx.amountToChange + "", t6, t7, t8, t9, t10_value = ((ctx.rates[ctx.selectedTo] - ctx.rateOffered) * ctx.amountToChange)/ ctx.rates[ctx.selectedTo] + "", t10, t11, t12;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("What you get: ");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(ctx.selectedTo);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("You are lossing ");
    			t6 = text(t6_value);
    			t7 = space();
    			t8 = text(ctx.selectedTo);
    			t9 = text("\n\t\t\t\t\t\t= ");
    			t10 = text(t10_value);
    			t11 = space();
    			t12 = text(ctx.selectedFrom);
    			add_location(p0, file$2, 38, 6, 1072);
    			add_location(p1, file$2, 39, 6, 1143);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.rateOffered || changed.amountToChange) && t1_value !== (t1_value = ctx.rateOffered * ctx.amountToChange + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if (changed.selectedTo) {
    				set_data_dev(t3, ctx.selectedTo);
    			}

    			if ((changed.rates || changed.selectedTo || changed.rateOffered || changed.amountToChange) && t6_value !== (t6_value = (ctx.rates[ctx.selectedTo] - ctx.rateOffered) * ctx.amountToChange + "")) {
    				set_data_dev(t6, t6_value);
    			}

    			if (changed.selectedTo) {
    				set_data_dev(t8, ctx.selectedTo);
    			}

    			if ((changed.rates || changed.selectedTo || changed.rateOffered || changed.amountToChange) && t10_value !== (t10_value = ((ctx.rates[ctx.selectedTo] - ctx.rateOffered) * ctx.amountToChange)/ ctx.rates[ctx.selectedTo] + "")) {
    				set_data_dev(t10, t10_value);
    			}

    			if (changed.selectedFrom) {
    				set_data_dev(t12, ctx.selectedFrom);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p0);
    				detach_dev(t4);
    				detach_dev(p1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(38:5) {#if rateOffered}", ctx });
    	return block;
    }

    // (33:3) <FetchRates baseCurrency={selectedFrom} targetCurrencies={Object.keys(currencies)}     let:rates>
    function create_default_slot$1(ctx) {
    	var input, input_updating = false, t0, t1, p, t2, t3_value = ctx.rates[ctx.selectedTo] + "", t3, dispose;

    	function input_input_handler_1() {
    		input_updating = true;
    		ctx.input_input_handler_1.call(input);
    	}

    	var if_block = (ctx.amountToChange) && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			p = element("p");
    			t2 = text("Current rate: ");
    			t3 = text(t3_value);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "Amount to change");
    			attr_dev(input, "min", "0");
    			add_location(input, file$2, 34, 4, 850);
    			add_location(p, file$2, 45, 4, 1362);
    			dispose = listen_dev(input, "input", input_input_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.amountToChange);

    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},

    		p: function update(changed, ctx) {
    			if (!input_updating && changed.amountToChange) set_input_value(input, ctx.amountToChange);
    			input_updating = false;

    			if (ctx.amountToChange) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.rates || changed.selectedTo) && t3_value !== (t3_value = ctx.rates[ctx.selectedTo] + "")) {
    				set_data_dev(t3, t3_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(input);
    				detach_dev(t0);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(t1);
    				detach_dev(p);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(33:3) <FetchRates baseCurrency={selectedFrom} targetCurrencies={Object.keys(currencies)}     let:rates>", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var t, main, current;

    	var header = new Header({
    		props: { title: "Currency loss" },
    		$$inline: true
    	});

    	var if_block = (currencies) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			header.$$.fragment.c();
    			t = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "main svelte-gidnlq");
    			add_location(main, file$2, 26, 0, 444);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (currencies) if_block.p(changed, ctx);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(header, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(main);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

    	let { name } = $$props;
    	let selectedFrom;
    	let selectedTo;
    	let amountToChange;
    	let rateOffered;

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function selectcurrencies0_selected_binding(value) {
    		selectedFrom = value;
    		$$invalidate('selectedFrom', selectedFrom);
    	}

    	function selectcurrencies1_selected_binding(value_1) {
    		selectedTo = value_1;
    		$$invalidate('selectedTo', selectedTo);
    	}

    	function input_input_handler() {
    		rateOffered = to_number(this.value);
    		$$invalidate('rateOffered', rateOffered);
    	}

    	function input_input_handler_1() {
    		amountToChange = to_number(this.value);
    		$$invalidate('amountToChange', amountToChange);
    	}

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name, selectedFrom, selectedTo, amountToChange, rateOffered };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('selectedFrom' in $$props) $$invalidate('selectedFrom', selectedFrom = $$props.selectedFrom);
    		if ('selectedTo' in $$props) $$invalidate('selectedTo', selectedTo = $$props.selectedTo);
    		if ('amountToChange' in $$props) $$invalidate('amountToChange', amountToChange = $$props.amountToChange);
    		if ('rateOffered' in $$props) $$invalidate('rateOffered', rateOffered = $$props.rateOffered);
    	};

    	return {
    		name,
    		selectedFrom,
    		selectedTo,
    		amountToChange,
    		rateOffered,
    		selectcurrencies0_selected_binding,
    		selectcurrencies1_selected_binding,
    		input_input_handler,
    		input_input_handler_1
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["name"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
