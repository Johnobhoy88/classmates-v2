// Ported from classmates/src/scripts/games/measure.js
// All content exactly preserved.

export interface MeasureQuestion {
  q: string;
  correct: string;
  opts: string[];
}

export type MeasureLevel = 1 | 2 | 3;

export const MEASURE_DATA: Record<MeasureLevel, MeasureQuestion[]> = {
  1:[
    {q:'Which is longer: your finger or your arm?',correct:'Arm',opts:['Finger','Arm']},
    {q:'Which is heavier: a feather or a brick?',correct:'Brick',opts:['Feather','Brick']},
    {q:'Which holds more: a cup or a bath?',correct:'Bath',opts:['Cup','Bath']},
    {q:'Which is taller: a house or a dog?',correct:'House',opts:['Dog','House']},
    {q:'Which is lighter: a balloon or a book?',correct:'Balloon',opts:['Balloon','Book']},
    {q:'Which is shorter: a pencil or a ruler?',correct:'Pencil',opts:['Pencil','Ruler']},
    {q:'Which holds more: a spoon or a bucket?',correct:'Bucket',opts:['Spoon','Bucket']},
    {q:'Which is heavier: an apple or a car?',correct:'Car',opts:['Apple','Car']},
    {q:'Which is longer: a worm or a snake?',correct:'Snake',opts:['Worm','Snake']},
    {q:'Which is colder: ice cream or soup?',correct:'Ice cream',opts:['Ice cream','Soup']}
  ],
  2:[
    {q:'How many centimetres in 1 metre?',correct:'100',opts:['10','100','1000','50']},
    {q:'How many grams in 1 kilogram?',correct:'1000',opts:['10','100','1000','500']},
    {q:'How many millilitres in 1 litre?',correct:'1000',opts:['10','100','1000','500']},
    {q:'Which is longer: 50cm or 1m?',correct:'1m',opts:['50cm','1m']},
    {q:'Which is heavier: 500g or 1kg?',correct:'1kg',opts:['500g','1kg']},
    {q:'How many cm in half a metre?',correct:'50',opts:['25','50','75','100']},
    {q:'Which holds more: 500ml or 1 litre?',correct:'1 litre',opts:['500ml','1 litre']},
    {q:'A pencil is about how long?',correct:'15cm',opts:['15cm','15m','15mm','150cm']},
    {q:'A bag of sugar weighs about?',correct:'1kg',opts:['1g','10g','100g','1kg']},
    {q:'A glass holds about?',correct:'250ml',opts:['25ml','250ml','2500ml','25 litres']}
  ],
  3:[
    {q:'How many metres in 1 kilometre?',correct:'1000',opts:['10','100','1000','10000']},
    {q:'Convert 2.5kg to grams:',correct:'2500g',opts:['25g','250g','2500g','25000g']},
    {q:'Convert 3 litres to ml:',correct:'3000ml',opts:['30ml','300ml','3000ml','30000ml']},
    {q:'How many mm in 1 cm?',correct:'10',opts:['1','10','100','1000']},
    {q:'5km = how many metres?',correct:'5000',opts:['50','500','5000','50000']},
    {q:'1500ml = how many litres?',correct:'1.5',opts:['0.15','1.5','15','150']},
    {q:'2300g = how many kg?',correct:'2.3',opts:['0.23','2.3','23','230']},
    {q:'Perimeter of a 5cm square?',correct:'20cm',opts:['10cm','20cm','25cm','50cm']},
    {q:'Area of a 4cm x 3cm rectangle?',correct:'12cm\u00B2',opts:['7cm\u00B2','12cm\u00B2','14cm\u00B2','24cm\u00B2']},
    {q:'A marathon is about?',correct:'42km',opts:['4.2km','42km','420km','4200km']}
  ]
};
