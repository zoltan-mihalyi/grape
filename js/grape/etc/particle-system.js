define(['../collections/bag', '../class', '../game/system', '../utils'], function (Bag, Class, System, Utils) {

    function compile(particle) {
        var stopsByAttr = {};

        if (particle.size === undefined) {
            particle.size = 1;
        }
        particle.speedX = particle.speedX || 0;
        particle.speedY = particle.speedY || 0;
        particle.accX = particle.accX || 0;
        particle.accY = particle.accY || 0;
        particle.color = particle.color || 'black';

        for (var i in particle) {
            if (i === 'stops' || i === 'duration') {
                continue;
            }

            stopsByAttr[i] = [
                {
                    offset: 0,
                    value: particle[i]
                }
            ];
        }

        for (i = 0; i < particle.stops.length; i++) { //ordered by offset
            var stop = particle.stops[i];
            for (var j in stop) {
                if (j !== 'offset') {
                    var attr = {
                        offset: stop.offset,
                        value: stop[j]
                    };
                    if (stopsByAttr[j]) {
                        stopsByAttr[j].push(attr);
                    } else {
                        stopsByAttr[j] = [attr];
                    }
                }
            }
        }

        return {
            stopsByAttr: stopsByAttr,
            stops: particle.stops,
            duration: particle.duration
        };
    }

    function create(x, y, type) {

//        var speed = pick(opts.speed || 0);
//        var direction = pick(opts.direction || 0);
//        var speedX = -Math.cos(-direction / 180 * Math.PI) * speed;
//        var speedY = Math.sin(-direction / 180 * Math.PI) * speed;
//
//
//        var gravity = pick(opts.gravity || 0);
//        var gravityDirection = pick(opts.gravityDirection || 0);
//        var accX = -Math.cos(-gravityDirection / 180 * Math.PI) * gravity;
//        var accY = Math.sin(-gravityDirection / 180 * Math.PI) * gravity;


        var particle = {
            stops: type.stops,
            stopsByAttr: type.stopsByAttr,
            elapsed: 0,
            duration: pick(type.duration || 0),
            x: x,
            y: y,
            lastStop: -1
        };

        return particle;
    }


    function frame(particle) {
        var percent = particle.elapsed / particle.duration * 100;

        for (var i = particle.lastStop + 1; i < particle.stops.length; i++) { //update left props
            if (particle.stops[i].offset > percent) {
                break;
            }
            for (var j in particle.stops[i]) {
                if (j !== 'offset') {
                    particle.attrs[j].from = particle.stops[i].offset;
                    particle.attrs[j].fromValue = particle.stops[i][j];
                }
            }
        }

        if (++particle.elapsed > particle.duration) {
            particle.remove();
        }
    }


    function pick(value) {
        var v0;
        if (Utils.isArray(value)) {
            v0 = value[0];
            if (typeof v0 === 'number') {
                return v0 + Math.random() * (value[1] - v0); //interval
            } else {
                return value[Math.random() * value.length >> 0]; //pick a string
            }
        } else {
            return value;
        }
    }

    var Emitter = Class({
        init: function (opts, system) {
            var shape = Shapes[opts.shape];
            if (!shape) {
                throw new Error('Emitter "' + opts.shape + '" does not exist.');
            }
            this.shape = shape;

            this.x = opts.x;
            this.y = opts.y;
            this.width = opts.width;
            this.height = opts.height;
            this.system = system;
            this.actual = 0;
            this.duration = opts.duration || Infinity;
            this.rate = opts.rate || 1;
            this.emits = opts.emits;
        },
        emit: function () {
            var pos = this.shape(this.width, this.height);
            this.system.createParticle(this.x + pos.x, this.y + pos.y, this.emits);
        },
        remove: function () {

        }
    });

    var Shapes = {
        rectangle: function (w, h) {
            return {
                x: Math.random() * w,
                y: Math.random() * h
            };
        },
        ellipse: function (w, h) {
            var angle = Math.random() * Math.PI * 2;
            var r = Math.sqrt(Math.random());

            return {
                x: Math.cos(angle) * r * w / 2,
                y: Math.sin(angle) * r * h / 2
            };
        }
    };

    var Particles = {
        circle: function (ctx, opts) {
            ctx.beginPath();
            ctx.arc(opts.x, opts.y, opts.radius, Math.PI * 2, false);
            ctx.fill();
        }
    };

    var ParticleSystem = Class(System, {
        init: function () {
            this.particles = new Bag();
            this.emitters = new Bag();
        },
        createEmitter: function (opts) {
            var emitter = new Emitter(opts);
            this.emitters.push(emitter);
            emitter.system = this;
            return emitter;
        },
        createParticle: function (x, y, opts) {
            var renderer = Particles[opts.shape];
            if (!renderer) {
                throw new Error('Particle type "' + opts.shape + '" does not exist.');
            }

            var speed = pick(opts.speed || 0);
            var direction = pick(opts.direction || 0);
            var speedX = -Math.cos(-direction / 180 * Math.PI) * speed;
            var speedY = Math.sin(-direction / 180 * Math.PI) * speed;


            var gravity = pick(opts.gravity || 0);
            var gravityDirection = pick(opts.gravityDirection || 0);
            var accX = -Math.cos(-gravityDirection / 180 * Math.PI) * gravity;
            var accY = Math.sin(-gravityDirection / 180 * Math.PI) * gravity;

            this.particles.push({
                radius: pick(opts.radius),
                drawMode: pick(opts.drawMode),
                duration: pick(opts.duration),
                speedX: speedX,
                speedY: speedY,
                accX: accX,
                accY: accY,
                color: pick(opts.color),
                x: x,
                y: y,
                elapsed: 0,
                stops: opts.stops,
                renderer: renderer
            });
        },
        'event render': function (ctx) {
            var i, emitter, particle, state;
            for (i = 0; i < this.emitters.length; i++) {
                emitter = this.emitters[i];

                emitter.actual += emitter.rate;
                while (emitter.actual-- > 0) {
                    emitter.emit();
                }

                emitter.duration -= 1;
                if (emitter.duration <= 0) {
                    this.emitters.remove(i);
                    i--;
                }
            }
            for (i = 0; i < this.particles.length; i++) {
                particle = this.particles[i];

                particle.elapsed++;
                if (particle.elapsed > particle.duration) {
                    this.particles.remove(i);
                    i--;
                }

                state = particle.elapsed / particle.duration;

                ctx.fillStyle = particle.color;

                particle.renderer(ctx, particle);


                //compute

                particle.speedX += particle.accX;
                particle.speedY += particle.accY;

                particle.x += particle.speedX;
                particle.y += particle.speedY;
            }
        }
    });

    return ParticleSystem;
});