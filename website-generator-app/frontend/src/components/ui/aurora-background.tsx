"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const AuroraBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current || !containerRef.current) return;
        const currentMount = mountRef.current;
        const container = containerRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: "high-performance"
        });

        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '0';
        renderer.domElement.style.display = 'block';
        currentMount.appendChild(renderer.domElement);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector2(width, height) }
            },
            vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
            fragmentShader: `
                uniform float iTime;
                uniform vec2 iResolution;
                #define NUM_OCTAVES 3

                float rand(vec2 n) {
                    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
                }

                float noise(vec2 p) {
                    vec2 ip = floor(p);
                    vec2 u = fract(p);
                    u = u * u * (3.0 - 2.0 * u);
                    float res = mix(
                        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
                        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
                        u.y
                    );
                    return res * res;
                }

                float fbm(vec2 x) {
                    float v = 0.0;
                    float a = 0.3;
                    vec2 shift = vec2(100);
                    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                    for(int i = 0; i < NUM_OCTAVES; ++i) {
                        v += a * noise(x);
                        x = rot * x * 2.0 + shift;
                        a *= 0.4;
                    }
                    return v;
                }

                void main() {
                    vec2 p = ((gl_FragCoord.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6., -4., 4., 6.);
                    vec4 o = vec4(0.);
                    float f = 2. + fbm(p + vec2(iTime * 5., 0.)) * .5;

                    for(float i = 0.; i++ < 35.;) {
                        vec2 v = p + cos(i * i + (iTime + p.x * .08) * .025 + i * vec2(13., 11.)) * 3.5;
                        float tailNoise = fbm(v + vec2(iTime * .5, i)) * .3 * (1. - (i / 35.));

                        // Blue-white glowing colors (user requested blue and white glow)
                        vec4 auroraColors = vec4(
                            .6 + .2 * sin(i * .2 + iTime * .4),   // Red: 0.4-0.8
                            .7 + .2 * cos(i * .3 + iTime * .5),   // Green: 0.5-0.9
                            .9 + .1 * sin(i * .4 + iTime * .3),   // Blue: 0.8-1.0 (highest for blue glow)
                            1.
                        );

                        vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * .8)) / length(max(v, vec2(v.x * f * .015, v.y * 1.5)));
                        float thinnessFactor = smoothstep(0., 1., i / 35.) * .6;
                        o += currentContribution * (1. + tailNoise * .8) * thinnessFactor;
                    }

                    o = tanh(pow(o / 100., vec4(1.6)));
                    gl_FragColor = o * 1.5;
                }
            `
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let animationFrameId: number;
        let isAnimating = true;

        const animate = () => {
            if (isAnimating) {
                animationFrameId = requestAnimationFrame(animate);
                material.uniforms.iTime.value += 0.016;
                renderer.render(scene, camera);
            }
        };

        // Intersection Observer to pause animation when not visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isAnimating) {
                        isAnimating = true;
                        animate();
                    } else if (!entry.isIntersecting && isAnimating) {
                        isAnimating = false;
                        cancelAnimationFrame(animationFrameId);
                    }
                });
            },
            { threshold: 0 }
        );

        if (container) {
            observer.observe(container);
        }

        const handleResize = () => {
            if (!container) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            renderer.setSize(newWidth, newHeight);
            material.uniforms.iResolution.value.set(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            isAnimating = false;
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            if (currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            material.dispose();
            geometry.dispose();
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <div ref={mountRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        </div>
    );
};
