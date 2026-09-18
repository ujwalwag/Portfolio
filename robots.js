/* Animated robotics line-art, carried over from the original site and recoloured.
   Defines window.initRobotics3DAnimations(), called by site.js once GSAP is ready. */
// 3D Robotics Animations
function initRobotics3DAnimations() {
  // Randomize positions of all robotics elements
  function randomizeElementPosition(element, minTop = 5, maxTop = 85, minLeft = 2, maxLeft = 90) {
    if (element) {
      const top = minTop + Math.random() * (maxTop - minTop);
      const left = minLeft + Math.random() * (maxLeft - minLeft);
      element.style.top = top + '%';
      element.style.left = left + '%';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }
  }

  // Restructured positions - symmetric layout avoiding hero content
  // Hero section is centered (~25-45% top), animations frame around it
  
  // Top row - evenly spaced
  randomizeElementPosition(document.getElementById('roboticArm3D'), 10, 20, 5, 18);      // Top-left
  randomizeElementPosition(document.getElementById('drone3D'), 10, 20, 28, 42);        // Top-left-center
  randomizeElementPosition(document.getElementById('rover3D'), 10, 20, 58, 72);       // Top-right-center
  randomizeElementPosition(document.getElementById('lidar3D'), 10, 20, 82, 95);        // Top-right
  
  // Bottom row - evenly spaced
  randomizeElementPosition(document.getElementById('humanoid3D'), 58, 72, 5, 22);      // Bottom-left
  randomizeElementPosition(document.getElementById('neuralNetwork3D'), 58, 72, 38, 62); // Bottom-center
  randomizeElementPosition(document.getElementById('dataAnalytics3D'), 58, 72, 78, 95); // Bottom-right

  // Robotic Arm 3D Animation
  const arm3D = document.getElementById('roboticArm3D');
  const segment1Group = document.getElementById('arm-segment1-group');
  const segment2Group = document.getElementById('arm-segment2-group');
  const gripper1 = document.getElementById('gripper1-3d');
  const gripper2 = document.getElementById('gripper2-3d');

  if (arm3D && typeof gsap !== 'undefined' && segment1Group && segment2Group) {
    // Function to update SVG transform attribute directly
    function setSVGRotation(element, angle) {
      if (element) {
        const currentTransform = element.getAttribute('transform') || '';
        // Remove existing rotation
        const cleaned = currentTransform.replace(/rotate\([^)]*\)/g, '').trim();
        // Add new rotation at the start
        element.setAttribute('transform', `rotate(${angle}) ${cleaned}`.trim());
      }
    }

    // Function to update gripper rotation
    // Gripper lines: gripper1 goes to (20, -15) ≈ -37° from horizontal
    //                gripper2 goes to (20, 15) ≈ +37° from horizontal
    // Base angles: gripper1 base = -37°, gripper2 base = +37°
    // To close: rotate gripper1 by +37° (to 0°), gripper2 by -37° (to 0°)
    // To open: rotate further away from 0°
    const GRIPPER1_BASE_ANGLE = -37; // atan2(-15, 20) ≈ -37°
    const GRIPPER2_BASE_ANGLE = 37;  // atan2(15, 20) ≈ 37°
    
    function setGripperRotation(gripperElement, targetAngle, isGripper1) {
      if (gripperElement) {
        // targetAngle is the final angle from horizontal (0° = closed/horizontal)
        // For gripper1: rotation = targetAngle - baseAngle = targetAngle - (-37) = targetAngle + 37
        // For gripper2: rotation = targetAngle - baseAngle = targetAngle - 37
        const baseAngle = isGripper1 ? GRIPPER1_BASE_ANGLE : GRIPPER2_BASE_ANGLE;
        const rotation = targetAngle - baseAngle;
        gripperElement.setAttribute('transform', `rotate(${rotation} 0 0)`);
      }
    }
    
    // Initialize grippers to closed position (horizontal/0°)
    if (gripper1) setGripperRotation(gripper1, 0, true);
    if (gripper2) setGripperRotation(gripper2, 0, false);

    // Realistic robotic arm movement sequence using SVG transform attribute
    const armTimeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    
    // Phase 1: Extend arm outward (lift and rotate base)
    armTimeline
      .to({}, {
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = progress * 45;
          setSVGRotation(segment1Group, angle);
        }
      }, 0)
      // Phase 2: Extend second segment downward to reach
      .to({}, {
        duration: 2,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = -progress * 60;
          const currentTransform = segment2Group.getAttribute('transform') || '';
          const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
          const translate = translateMatch ? translateMatch[0] : 'translate(0, -80)';
          segment2Group.setAttribute('transform', `${translate} rotate(${angle})`);
        }
      }, 1)
      // Phase 3: Fine adjustment - slight forward movement
      .to({}, {
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = -60 - (progress * 10);
          const currentTransform = segment2Group.getAttribute('transform') || '';
          const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
          const translate = translateMatch ? translateMatch[0] : 'translate(0, -80)';
          segment2Group.setAttribute('transform', `${translate} rotate(${angle})`);
        }
      }, 3)
      // Phase 4: Open gripper to grasp
      .to({}, {
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: function() {
          const progress = this.progress();
          // Open: gripper1 goes to -30°, gripper2 goes to +30° (from horizontal)
          const targetAngle1 = -progress * 30;
          const targetAngle2 = progress * 30;
          setGripperRotation(gripper1, targetAngle1, true);
          setGripperRotation(gripper2, targetAngle2, false);
        }
      }, 3.5)
      // Phase 5: Close gripper (grasp)
      .to({}, {
        duration: 0.6,
        ease: 'power2.in',
        onUpdate: function() {
          const progress = this.progress();
          // Close: from -30° to 0° (horizontal/closed)
          const targetAngle1 = -30 + (progress * 30);
          const targetAngle2 = 30 - (progress * 30);
          setGripperRotation(gripper1, targetAngle1, true);
          setGripperRotation(gripper2, targetAngle2, false);
        }
      }, 4.2)
      // Phase 6: Lift object - retract second segment
      .to({}, {
        duration: 2,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = -70 + (progress * 30);
          const currentTransform = segment2Group.getAttribute('transform') || '';
          const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
          const translate = translateMatch ? translateMatch[0] : 'translate(0, -80)';
          segment2Group.setAttribute('transform', `${translate} rotate(${angle})`);
        }
      }, 5)
      // Phase 7: Rotate base back
      .to({}, {
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = 45 - (progress * 65);
          setSVGRotation(segment1Group, angle);
        }
      }, 6)
      // Phase 8: Extend to drop position
      .to({}, {
        duration: 1.5,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = -40 - (progress * 10);
          const currentTransform = segment2Group.getAttribute('transform') || '';
          const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
          const translate = translateMatch ? translateMatch[0] : 'translate(0, -80)';
          segment2Group.setAttribute('transform', `${translate} rotate(${angle})`);
        }
      }, 7.5)
      // Phase 9: Open gripper to release
      .to({}, {
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: function() {
          const progress = this.progress();
          // Open: gripper1 goes to -30°, gripper2 goes to +30°
          const targetAngle1 = -progress * 30;
          const targetAngle2 = progress * 30;
          setGripperRotation(gripper1, targetAngle1, true);
          setGripperRotation(gripper2, targetAngle2, false);
        }
      }, 9)
      // Phase 10: Close gripper
      .to({}, {
        duration: 0.4,
        ease: 'power2.in',
        onUpdate: function() {
          const progress = this.progress();
          // Close: from -30° to 0° (horizontal/closed)
          const targetAngle1 = -30 + (progress * 30);
          const targetAngle2 = 30 - (progress * 30);
          setGripperRotation(gripper1, targetAngle1, true);
          setGripperRotation(gripper2, targetAngle2, false);
        }
      }, 9.5)
      // Phase 11: Return to home position
      .to({}, {
        duration: 2,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = -50 + (progress * 50);
          const currentTransform = segment2Group.getAttribute('transform') || '';
          const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
          const translate = translateMatch ? translateMatch[0] : 'translate(0, -80)';
          segment2Group.setAttribute('transform', `${translate} rotate(${angle})`);
        }
      }, 10)
      .to({}, {
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = -20 - (progress * 20);
          setSVGRotation(segment1Group, angle);
        }
      }, 10.5)
      .to({}, {
        duration: 1.5,
        ease: 'power1.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const angle = 0 - (progress * 0);
          const currentTransform = segment2Group.getAttribute('transform') || '';
          const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
          const translate = translateMatch ? translateMatch[0] : 'translate(0, -80)';
          segment2Group.setAttribute('transform', `${translate} rotate(${angle})`);
        }
      }, 12);

    // Subtle 3D perspective rotation
    gsap.to(arm3D, {
      rotationY: 10,
      rotationX: -3,
      duration: 5,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
  }

  // Rover 3D Animation
  const rover3D = document.getElementById('rover3D');
  const wheelInners = ['wheel1-inner', 'wheel2-inner', 'wheel3-inner'];

  if (rover3D && typeof gsap !== 'undefined') {
    // Rotate each wheel around its own center axis using CSS animation
    wheelInners.forEach((wheelInnerId) => {
      const wheelInner = document.getElementById(wheelInnerId);
      if (wheelInner) {
        // Add CSS class for rotation
        wheelInner.classList.add('wheel-rotating');
        // Set transform origin to center
        wheelInner.style.transformOrigin = '0 0';
      }
    });

    // Create a timeline for synchronized movement
    const roverTimeline = gsap.timeline({ repeat: -1 });
    
    // Forward movement
    roverTimeline
      .to(rover3D, {
        x: '+=30',
        duration: 2,
        ease: 'power1.inOut'
      })
      // Backward movement
      .to(rover3D, {
        x: '-=30',
        duration: 2,
        ease: 'power1.inOut'
      });

    // Subtle 3D rotation for depth
    gsap.to(rover3D, {
      rotationY: 8,
      rotationX: 1,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
  }

  // Drone 3D Animation
  const drone3D = document.getElementById('drone3D');
  const props = ['prop1-3d', 'prop2-3d', 'prop3-3d', 'prop4-3d'];

  if (drone3D && typeof gsap !== 'undefined') {
    // Rotate propellers
    props.forEach((propId, index) => {
      const prop = document.getElementById(propId);
      if (prop) {
        gsap.to(prop, {
          rotation: 360,
          duration: 0.3 + index * 0.05,
          ease: 'none',
          repeat: -1,
          transformOrigin: 'center'
        });
      }
    });

    // Floating/hovering motion
    gsap.to(drone3D, {
      y: '-=25',
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });

    // 3D tilt and rotation
    gsap.to(drone3D, {
      rotationX: 8,
      rotationZ: 5,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
  }

  // Lidar 3D Animation
  const lidar3D = document.getElementById('lidar3D');
  const scanLines = ['scan-line1', 'scan-line2', 'scan-line3', 'scan-line4'];
  const detectPoints = ['detect-point1', 'detect-point2', 'detect-point3', 'detect-point4'];

  if (lidar3D && typeof gsap !== 'undefined') {
    // Rotate scan lines around center (0, 0) of the lidar scanner
    scanLines.forEach((lineId, index) => {
      const line = document.getElementById(lineId);
      if (line) {
        // Lines start at (0, 0) and extend outward, so rotate around origin
        gsap.set(line, { svgOrigin: '0 0' });
        gsap.to(line, {
          rotation: 360,
          duration: 3,
          delay: index * 0.1,
          ease: 'none',
          repeat: -1,
          svgOrigin: '0 0'
        });
      }
    });

    // Pulse detection points
    detectPoints.forEach((pointId, index) => {
      const point = document.getElementById(pointId);
      if (point) {
        gsap.to(point, {
          scale: 1.8,
          opacity: 1,
          duration: 0.6,
          delay: index * 0.2,
          yoyo: true,
          repeat: -1,
          ease: 'power2.inOut'
        });
      }
    });

    // Rotate lidar rings around center
    const ring1 = document.getElementById('lidar-ring1');
    const ring2 = document.getElementById('lidar-ring2');
    if (ring1) {
      // Ring center is at (0, 0) in SVG coordinates
      gsap.set(ring1, { svgOrigin: '0 0' });
      gsap.to(ring1, {
        rotation: 360,
        duration: 8,
        ease: 'none',
        repeat: -1,
        svgOrigin: '0 0'
      });
    }
    if (ring2) {
      gsap.set(ring2, { svgOrigin: '0 0' });
      gsap.to(ring2, {
        rotation: -360,
        duration: 6,
        ease: 'none',
        repeat: -1,
        svgOrigin: '0 0'
      });
    }

    // 3D rotation
    gsap.to(lidar3D, {
      rotationY: 20,
      rotationX: -10,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
  }

  // Humanoid Robot 3D Animation
  const humanoid3D = document.getElementById('humanoid3D');
  const leftArm = document.getElementById('arm-left-3d');
  const rightArm = document.getElementById('arm-right-3d');
  const leftLeg = document.getElementById('leg-left-3d');
  const rightLeg = document.getElementById('leg-right-3d');

  if (humanoid3D && typeof gsap !== 'undefined') {
    // Walking animation
    const walkTimeline = gsap.timeline({ repeat: -1 });
    
    walkTimeline
      .to(leftArm, {
        rotation: -20,
        duration: 0.8,
        ease: 'power2.inOut',
        transformOrigin: 'top center'
      }, 0)
      .to(rightArm, {
        rotation: 20,
        duration: 0.8,
        ease: 'power2.inOut',
        transformOrigin: 'top center'
      }, 0)
      .to(leftLeg, {
        rotation: 15,
        duration: 0.8,
        ease: 'power2.inOut',
        transformOrigin: 'top center'
      }, 0)
      .to(rightLeg, {
        rotation: -15,
        duration: 0.8,
        ease: 'power2.inOut',
        transformOrigin: 'top center'
      }, 0)
      .to(leftArm, {
        rotation: 20,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      .to(rightArm, {
        rotation: -20,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      .to(leftLeg, {
        rotation: -15,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      .to(rightLeg, {
        rotation: 15,
        duration: 0.8,
        ease: 'power2.inOut'
      });

    // 3D body rotation
    gsap.to(humanoid3D, {
      rotationY: 15,
      rotationX: -3,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });

    // Slight floating
    gsap.to(humanoid3D, {
      y: '-=10',
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
  }

  // Data Analytics 3D Animation
  const dataAnalytics3D = document.getElementById('dataAnalytics3D');
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const bar3 = document.getElementById('bar3');
  const bar4 = document.getElementById('bar4');
  const bar5 = document.getElementById('bar5');
  const bar6 = document.getElementById('bar6');
  const lineGraph = document.getElementById('lineGraph');
  const point1 = document.getElementById('point1');
  const point2 = document.getElementById('point2');
  const point3 = document.getElementById('point3');
  const point4 = document.getElementById('point4');
  const point5 = document.getElementById('point5');
  const point6 = document.getElementById('point6');
  const dataFlow1 = document.getElementById('dataFlow1');
  const dataFlow2 = document.getElementById('dataFlow2');
  const dataFlow3 = document.getElementById('dataFlow3');
  const percent1 = document.getElementById('percent1');
  const percent2 = document.getElementById('percent2');
  const percent3 = document.getElementById('percent3');

  if (dataAnalytics3D && typeof gsap !== 'undefined') {
    // Initialize bars at height 0
    const bars = [bar1, bar2, bar3, bar4, bar5, bar6];
    bars.forEach(bar => {
      if (bar) {
        gsap.set(bar, { scaleY: 0, transformOrigin: 'bottom center' });
      }
    });

    // Initialize line graph (hidden)
    if (lineGraph) {
      gsap.set(lineGraph, { opacity: 0 });
    }

    // Initialize data points (hidden)
    const points = [point1, point2, point3, point4, point5, point6];
    points.forEach(point => {
      if (point) {
        gsap.set(point, { scale: 0, opacity: 0 });
      }
    });

    // Initialize percentage text (hidden)
    const percents = [percent1, percent2, percent3];
    percents.forEach(percent => {
      if (percent) {
        gsap.set(percent, { opacity: 0 });
      }
    });

    // Main animation timeline
    const analyticsTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // Animate bars growing up
    analyticsTimeline
      .to(bar1, { duration: 0.6, scaleY: 1, ease: 'power2.out' }, 0)
      .to(bar2, { duration: 0.6, scaleY: 1, ease: 'power2.out' }, 0.1)
      .to(bar3, { duration: 0.6, scaleY: 1, ease: 'power2.out' }, 0.2)
      .to(bar4, { duration: 0.6, scaleY: 1, ease: 'power2.out' }, 0.3)
      .to(bar5, { duration: 0.6, scaleY: 1, ease: 'power2.out' }, 0.4)
      .to(bar6, { duration: 0.6, scaleY: 1, ease: 'power2.out' }, 0.5);

    // Animate line graph appearing
    if (lineGraph) {
      analyticsTimeline.to(lineGraph, {
        duration: 1.5,
        opacity: 0.7,
        ease: 'power1.inOut'
      }, 0.8);
    }

    // Animate data points appearing
    analyticsTimeline
      .to(point1, { duration: 0.3, scale: 1, opacity: 0.8, ease: 'back.out(2)' }, 1.2)
      .to(point2, { duration: 0.3, scale: 1, opacity: 0.8, ease: 'back.out(2)' }, 1.3)
      .to(point3, { duration: 0.3, scale: 1, opacity: 0.8, ease: 'back.out(2)' }, 1.4)
      .to(point4, { duration: 0.3, scale: 1, opacity: 0.8, ease: 'back.out(2)' }, 1.5)
      .to(point5, { duration: 0.3, scale: 1, opacity: 0.8, ease: 'back.out(2)' }, 1.6)
      .to(point6, { duration: 0.3, scale: 1, opacity: 0.8, ease: 'back.out(2)' }, 1.7);

    // Animate percentage text appearing
    analyticsTimeline
      .to(percent1, { duration: 0.4, opacity: 0.5, ease: 'power2.out' }, 2)
      .to(percent2, { duration: 0.4, opacity: 0.5, ease: 'power2.out' }, 2.1)
      .to(percent3, { duration: 0.4, opacity: 0.5, ease: 'power2.out' }, 2.2);

    // Data flow animation (circles moving across)
    if (dataFlow1 && dataFlow2 && dataFlow3) {
      const flowTimeline = gsap.timeline({ repeat: -1 });
      flowTimeline
        .to(dataFlow1, {
          duration: 2,
          x: 240,
          ease: 'power1.inOut'
        })
        .to(dataFlow2, {
          duration: 2,
          x: 240,
          ease: 'power1.inOut'
        }, 0.3)
        .to(dataFlow3, {
          duration: 2,
          x: 240,
          ease: 'power1.inOut'
        }, 0.6)
        .set([dataFlow1, dataFlow2, dataFlow3], { x: 0 });
    }

    // Pulsing effect on data points
    points.forEach(point => {
      if (point) {
        gsap.to(point, {
          scale: 1.3,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 2.5
        });
      }
    });

    // Subtle 3D rotation
    gsap.to(dataAnalytics3D, {
      rotationY: 3,
      rotationX: 2,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      transformStyle: 'preserve-3d'
    });
  }

  // Neural Network 3D Animation
  const neuralNetwork3D = document.getElementById('neuralNetwork3D');
  const inputNodes = ['input1', 'input2', 'input3', 'input4', 'input5'].map(id => document.getElementById(id));
  const hidden1Nodes = ['hidden1-1', 'hidden1-2', 'hidden1-3', 'hidden1-4'].map(id => document.getElementById(id));
  const hidden2Nodes = ['hidden2-1', 'hidden2-2', 'hidden2-3'].map(id => document.getElementById(id));
  const outputNodes = ['output1', 'output2'].map(id => document.getElementById(id));
  const connections = Array.from({ length: 24 }, (_, i) => document.getElementById(`conn${i + 1}`));
  const particles = ['particle1', 'particle2', 'particle3'].map(id => document.getElementById(id));

  if (neuralNetwork3D && typeof gsap !== 'undefined') {
    // Initialize connections (hidden)
    connections.forEach(conn => {
      if (conn) {
        gsap.set(conn, { opacity: 0 });
      }
    });

    // Initialize particles (hidden)
    particles.forEach(particle => {
      if (particle) {
        gsap.set(particle, { scale: 0, opacity: 0 });
      }
    });

    // Main animation timeline
    const neuralTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    // Animate connections appearing (staggered)
    connections.forEach((conn, index) => {
      if (conn) {
        neuralTimeline.to(conn, {
          duration: 0.3,
          opacity: 0.3 + (index % 3) * 0.1,
          ease: 'power1.out'
        }, index * 0.05);
      }
    });

    // Pulse input nodes
    inputNodes.forEach((node, index) => {
      if (node) {
        gsap.to(node, {
          scale: 1.3,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: index * 0.2
        });
      }
    });

    // Pulse hidden layer 1 nodes
    hidden1Nodes.forEach((node, index) => {
      if (node) {
        gsap.to(node, {
          scale: 1.25,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 0.5 + index * 0.15
        });
      }
    });

    // Pulse hidden layer 2 nodes
    hidden2Nodes.forEach((node, index) => {
      if (node) {
        gsap.to(node, {
          scale: 1.2,
          duration: 1.4,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1 + index * 0.2
        });
      }
    });

    // Pulse output nodes
    outputNodes.forEach((node, index) => {
      if (node) {
        gsap.to(node, {
          scale: 1.15,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1.5 + index * 0.3
        });
      }
    });

    // Animate data particles flowing through network
    if (particles[0]) {
      const particle1Path = gsap.timeline({ repeat: -1 });
      particle1Path
        .to(particles[0], { duration: 0.3, scale: 1, opacity: 0.9, ease: 'power2.out' })
        .to(particles[0], { duration: 1.2, x: 100, y: 20, ease: 'power1.inOut' })
        .to(particles[0], { duration: 1, x: 200, y: -20, ease: 'power1.inOut' })
        .to(particles[0], { duration: 0.2, scale: 0, opacity: 0 })
        .set(particles[0], { x: -100, y: -80 });
    }

    if (particles[1]) {
      const particle2Path = gsap.timeline({ repeat: -1, delay: 0.4 });
      particle2Path
        .to(particles[1], { duration: 0.3, scale: 1, opacity: 0.9, ease: 'power2.out' })
        .to(particles[1], { duration: 1.2, x: 100, y: 0, ease: 'power1.inOut' })
        .to(particles[1], { duration: 1, x: 200, y: 20, ease: 'power1.inOut' })
        .to(particles[1], { duration: 0.2, scale: 0, opacity: 0 })
        .set(particles[1], { x: -100, y: -40 });
    }

    if (particles[2]) {
      const particle3Path = gsap.timeline({ repeat: -1, delay: 0.8 });
      particle3Path
        .to(particles[2], { duration: 0.3, scale: 1, opacity: 0.9, ease: 'power2.out' })
        .to(particles[2], { duration: 1.2, x: 100, y: -20, ease: 'power1.inOut' })
        .to(particles[2], { duration: 1, x: 200, y: -20, ease: 'power1.inOut' })
        .to(particles[2], { duration: 0.2, scale: 0, opacity: 0 })
        .set(particles[2], { x: -100, y: 0 });
    }

    // Animate connection lines (pulsing)
    connections.forEach((conn, index) => {
      if (conn) {
        gsap.to(conn, {
          strokeWidth: 1.5 + (index % 2) * 0.5,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: index * 0.1
        });
      }
    });

    // Subtle 3D rotation
    gsap.to(neuralNetwork3D, {
      rotationY: -4,
      rotationX: 3,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      transformStyle: 'preserve-3d'
    });
  }
}
