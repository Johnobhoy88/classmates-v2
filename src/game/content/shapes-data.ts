/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

// Ported from classmates/src/scripts/games/shapes.js
// All content exactly preserved — every question, SVG, and option.

export interface ShapeQuestion {
  q: string;
  svg: string;
  correct: string;
  opts: string[];
}

export type ShapesLevel = 1 | 2 | 3;

export const SHAPES_DATA: Record<ShapesLevel, ShapeQuestion[]> = {
  1:[
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><rect x="10" y="10" width="80" height="80" fill="#6c5ce7" rx="2"/></svg>',correct:'Square',opts:['Square','Circle','Triangle','Rectangle']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><circle cx="50" cy="50" r="40" fill="#e17055"/></svg>',correct:'Circle',opts:['Square','Circle','Triangle','Star']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><polygon points="50,10 90,90 10,90" fill="#00b894"/></svg>',correct:'Triangle',opts:['Triangle','Diamond','Pentagon','Square']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 120 80" width="170"><rect x="10" y="10" width="100" height="60" fill="#0984e3" rx="2"/></svg>',correct:'Rectangle',opts:['Square','Rectangle','Oval','Trapezoid']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><ellipse cx="50" cy="50" rx="45" ry="30" fill="#fdcb6e"/></svg>',correct:'Oval',opts:['Circle','Oval','Egg','Rectangle']},
    {q:'How many sides does a triangle have?',svg:'<svg viewBox="0 0 100 100" width="120"><polygon points="50,10 90,90 10,90" fill="#00b894" stroke="#2d3436" stroke-width="3"/></svg>',correct:'3',opts:['2','3','4','5']},
    {q:'How many corners does a square have?',svg:'<svg viewBox="0 0 100 100" width="120"><rect x="10" y="10" width="80" height="80" fill="#6c5ce7" stroke="#2d3436" stroke-width="3"/></svg>',correct:'4',opts:['3','4','5','6']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><polygon points="50,5 95,35 80,90 20,90 5,35" fill="#e84393"/></svg>',correct:'Pentagon',opts:['Hexagon','Pentagon','Octagon','Square']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><polygon points="50,10 90,50 50,90 10,50" fill="#f39c12"/></svg>',correct:'Diamond',opts:['Square','Diamond','Kite','Triangle']},
    {q:'Which shape has no corners?',svg:'',correct:'Circle',opts:['Square','Triangle','Circle','Rectangle']},
    {q:'What shape is this?',svg:'<svg viewBox="0 0 100 100" width="150"><polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill="#0abde3"/></svg>',correct:'Hexagon',opts:['Pentagon','Hexagon','Octagon','Circle']},
    {q:'How many sides does this shape have?',svg:'<svg viewBox="0 0 100 100" width="120"><rect x="10" y="10" width="80" height="60" fill="#f39c12" stroke="#2d3436" stroke-width="3"/></svg>',correct:'4',opts:['3','4','5','6']}
  ],
  2:[
    {q:'How many sides does a hexagon have?',svg:'<svg viewBox="0 0 100 100" width="130"><polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill="#0abde3"/></svg>',correct:'6',opts:['5','6','7','8']},
    {q:'What is a shape with 8 sides called?',svg:'<svg viewBox="0 0 100 100" width="130"><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#e17055"/></svg>',correct:'Octagon',opts:['Hexagon','Heptagon','Octagon','Decagon']},
    {q:'How many lines of symmetry does a square have?',svg:'',correct:'4',opts:['1','2','4','8']},
    {q:'A triangle with all sides equal is called?',svg:'',correct:'Equilateral',opts:['Isosceles','Equilateral','Scalene','Right-angle']},
    {q:'How many faces does a cube have?',svg:'',correct:'6',opts:['4','6','8','12']},
    {q:'How many edges does a cube have?',svg:'',correct:'12',opts:['6','8','12','16']},
    {q:'What is the name of a 3D sphere shape?',svg:'',correct:'Sphere',opts:['Circle','Ball','Sphere','Globe']},
    {q:'A rectangle has how many lines of symmetry?',svg:'',correct:'2',opts:['1','2','4','0']},
    {q:'What 3D shape is a tin of beans?',svg:'',correct:'Cylinder',opts:['Cube','Cuboid','Cylinder','Cone']},
    {q:'Which shape has exactly 3 lines of symmetry?',svg:'',correct:'Equilateral triangle',opts:['Square','Equilateral triangle','Rectangle','Pentagon']}
  ],
  3:[
    {q:'What is the angle in a right angle?',svg:'',correct:'90 degrees',opts:['45 degrees','90 degrees','180 degrees','360 degrees']},
    {q:'An angle less than 90 degrees is called?',svg:'',correct:'Acute',opts:['Acute','Obtuse','Reflex','Right']},
    {q:'An angle greater than 90 degrees is called?',svg:'',correct:'Obtuse',opts:['Acute','Obtuse','Straight','Sharp']},
    {q:'How many degrees in a full turn?',svg:'',correct:'360',opts:['90','180','270','360']},
    {q:'How many vertices does a triangular prism have?',svg:'',correct:'6',opts:['3','5','6','8']},
    {q:'What is the net of a cube made of?',svg:'',correct:'6 squares',opts:['4 squares','5 squares','6 squares','8 squares']},
    {q:'A parallelogram has how many pairs of parallel sides?',svg:'',correct:'2',opts:['0','1','2','4']},
    {q:'What shape has 4 sides and no right angles?',svg:'',correct:'Rhombus',opts:['Square','Rectangle','Rhombus','Trapezium']},
    {q:'How many faces does a triangular pyramid have?',svg:'',correct:'4',opts:['3','4','5','6']},
    {q:'Coordinates (3,5) means 3 along and 5...?',svg:'',correct:'Up',opts:['Down','Up','Left','Along']}
  ]
};
