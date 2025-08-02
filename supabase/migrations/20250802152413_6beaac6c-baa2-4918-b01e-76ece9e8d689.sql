-- Insert all subtopics from the curriculum JSON data
INSERT INTO bootcamp_subtopics (topic_id, name, subtopic_order) VALUES
-- Number & Place Value - Reading and Writing Large Numbers (npv1)
('npv1', 'Numbers to 10,000,000', 1),
('npv1', 'Place value understanding', 2),
('npv1', 'Standard and word form', 3),

-- Number & Place Value - Rounding Numbers (npv2)
('npv2', 'Rounding to nearest 10', 1),
('npv2', 'Rounding to nearest 100', 2),
('npv2', 'Rounding to nearest 1000', 3),
('npv2', 'Rounding to nearest 10000', 4),

-- Number & Place Value - Comparing and Ordering (npv3)
('npv3', 'Using < > = symbols', 1),
('npv3', 'Ordering large numbers', 2),
('npv3', 'Number lines', 3),

-- Number & Place Value - Roman Numerals (npv4)
('npv4', 'Roman numerals to 100', 1),
('npv4', 'Roman numerals to 1000', 2),
('npv4', 'Converting between systems', 3),

-- Number & Place Value - Negative Numbers (npv5)
('npv5', 'Understanding negative numbers', 1),
('npv5', 'Ordering negative numbers', 2),
('npv5', 'Temperature problems', 3),
('npv5', 'Number line with negatives', 4),

-- Number & Place Value - Prime Numbers and Factors (npv6)
('npv6', 'Identifying prime numbers', 1),
('npv6', 'Finding factors', 2),
('npv6', 'Finding multiples', 3),
('npv6', 'Common factors and multiples', 4),

-- Number & Place Value - Square and Cube Numbers (npv7)
('npv7', 'Square numbers to 144', 1),
('npv7', 'Cube numbers to 1000', 2),
('npv7', 'Recognizing patterns', 3),

-- Number & Place Value - Prime Factorization (npv8)
('npv8', 'Factor trees', 1),
('npv8', 'Prime factor form', 2),
('npv8', 'HCF using prime factors', 3),
('npv8', 'LCM using prime factors', 4),

-- Arithmetic Operations - Mental Addition and Subtraction (ao1)
('ao1', 'Adding multiples of 10, 100, 1000', 1),
('ao1', 'Subtracting multiples of 10, 100, 1000', 2),
('ao1', 'Near doubles', 3),
('ao1', 'Compensation strategies', 4),

-- Arithmetic Operations - Column Addition (ao2)
('ao2', '3-digit addition', 1),
('ao2', '4-digit addition', 2),
('ao2', '5+ digit addition', 3),
('ao2', 'Decimal addition', 4),

-- Arithmetic Operations - Column Subtraction (ao3)
('ao3', '3-digit subtraction', 1),
('ao3', '4-digit subtraction', 2),
('ao3', 'Subtraction with borrowing', 3),
('ao3', 'Decimal subtraction', 4),

-- Arithmetic Operations - Multiplication Tables (ao4)
('ao4', 'Tables 2-12', 1),
('ao4', 'Square numbers from tables', 2),
('ao4', 'Division facts from tables', 3),
('ao4', 'Quick recall strategies', 4),

-- Arithmetic Operations - Short Multiplication (ao5)
('ao5', '2-digit × 1-digit', 1),
('ao5', '3-digit × 1-digit', 2),
('ao5', 'Multiplying by 10, 100, 1000', 3),
('ao5', 'Decimal multiplication', 4),

-- Arithmetic Operations - Long Multiplication (ao6)
('ao6', '2-digit × 2-digit', 1),
('ao6', '3-digit × 2-digit', 2),
('ao6', 'Grid method', 3),
('ao6', 'Column method', 4),

-- Arithmetic Operations - Division Methods (ao7)
('ao7', 'Short division', 1),
('ao7', 'Long division', 2),
('ao7', 'Division with remainders', 3),
('ao7', 'Decimal division', 4),

-- Arithmetic Operations - Order of Operations (ao8)
('ao8', 'Understanding BODMAS', 1),
('ao8', 'Brackets first', 2),
('ao8', 'Mixed operations', 3),
('ao8', 'Complex calculations', 4),

-- Fractions, Decimals & Percentages - Understanding Fractions (fdp1)
('fdp1', 'Parts of a whole', 1),
('fdp1', 'Fraction notation', 2),
('fdp1', 'Unit fractions', 3),
('fdp1', 'Fraction diagrams', 4),

-- Fractions, Decimals & Percentages - Equivalent Fractions (fdp2)
('fdp2', 'Finding equivalent fractions', 1),
('fdp2', 'Simplifying fractions', 2),
('fdp2', 'Common denominators', 3),
('fdp2', 'Fraction walls', 4),

-- Fractions, Decimals & Percentages - Mixed Numbers (fdp3)
('fdp3', 'Mixed to improper', 1),
('fdp3', 'Improper to mixed', 2),
('fdp3', 'Comparing mixed numbers', 3),
('fdp3', 'Ordering fractions', 4),

-- Fractions, Decimals & Percentages - Adding and Subtracting Fractions (fdp4)
('fdp4', 'Same denominator', 1),
('fdp4', 'Different denominators', 2),
('fdp4', 'Mixed number operations', 3),
('fdp4', 'Problem solving', 4),

-- Fractions, Decimals & Percentages - Multiplying and Dividing Fractions (fdp5)
('fdp5', 'Fraction × whole number', 1),
('fdp5', 'Fraction × fraction', 2),
('fdp5', 'Dividing by fractions', 3),
('fdp5', 'Reciprocals', 4),

-- Fractions, Decimals & Percentages - Decimal Place Value (fdp6)
('fdp6', 'Tenths and hundredths', 1),
('fdp6', 'Thousandths', 2),
('fdp6', 'Decimal notation', 3),
('fdp6', 'Ordering decimals', 4),

-- Fractions, Decimals & Percentages - Converting FDP (fdp7)
('fdp7', 'Fraction to decimal', 1),
('fdp7', 'Decimal to fraction', 2),
('fdp7', 'Percentage basics', 3),
('fdp7', 'Common conversions', 4),

-- Fractions, Decimals & Percentages - Percentage Calculations (fdp8)
('fdp8', 'Finding percentages', 1),
('fdp8', 'Percentage increase', 2),
('fdp8', 'Percentage decrease', 3),
('fdp8', 'Reverse percentages', 4),

-- Ratio & Proportion - Understanding Ratio (rp1)
('rp1', 'Ratio notation', 1),
('rp1', 'Part to part ratios', 2),
('rp1', 'Part to whole ratios', 3),
('rp1', 'Equivalent ratios', 4),

-- Ratio & Proportion - Simplifying Ratios (rp2)
('rp2', 'Finding common factors', 1),
('rp2', 'Simplest form', 2),
('rp2', 'Ratios with units', 3),
('rp2', 'Three-part ratios', 4),

-- Ratio & Proportion - Sharing in Ratios (rp3)
('rp3', 'Dividing quantities', 1),
('rp3', 'Finding parts', 2),
('rp3', 'Finding totals', 3),
('rp3', 'Problem solving', 4),

-- Ratio & Proportion - Direct Proportion (rp4)
('rp4', 'Scaling up', 1),
('rp4', 'Scaling down', 2),
('rp4', 'Recipe problems', 3),
('rp4', 'Map scales', 4),

-- Algebra - Introduction to Algebra (alg1)
('alg1', 'Using letters for numbers', 1),
('alg1', 'Algebraic notation', 2),
('alg1', 'Terms and expressions', 3),
('alg1', 'Substitution basics', 4),

-- Algebra - Simplifying Expressions (alg2)
('alg2', 'Collecting like terms', 1),
('alg2', 'Simplifying expressions', 2),
('alg2', 'Expanding brackets', 3),
('alg2', 'Algebraic pyramids', 4),

-- Algebra - Simple Equations (alg3)
('alg3', 'One-step equations', 1),
('alg3', 'Two-step equations', 2),
('alg3', 'Equations with brackets', 3),
('alg3', 'Word to equation', 4),

-- Algebra - Sequences and Patterns (alg4)
('alg4', 'Number sequences', 1),
('alg4', 'Pattern rules', 2),
('alg4', 'Finding nth term', 3),
('alg4', 'Function machines', 4),

-- Geometry - 2D Shape Properties (geo1)
('geo1', 'Triangles', 1),
('geo1', 'Quadrilaterals', 2),
('geo1', 'Regular polygons', 3),
('geo1', 'Circle parts', 4),

-- Geometry - Perimeter (geo2)
('geo2', 'Rectangle perimeter', 1),
('geo2', 'Complex shapes', 2),
('geo2', 'Missing lengths', 3),
('geo2', 'Problem solving', 4),

-- Geometry - Area (geo3)
('geo3', 'Rectangle area', 1),
('geo3', 'Triangle area', 2),
('geo3', 'Parallelogram area', 3),
('geo3', 'Compound shapes', 4),

-- Geometry - 3D Shapes (geo4)
('geo4', 'Naming 3D shapes', 1),
('geo4', 'Properties of 3D shapes', 2),
('geo4', 'Faces, edges, vertices', 3),
('geo4', 'Nets of shapes', 4),

-- Geometry - Volume (geo5)
('geo5', 'Cuboid volume', 1),
('geo5', 'Counting cubes', 2),
('geo5', 'Capacity units', 3),
('geo5', 'Problem solving', 4),

-- Geometry - Angles (geo6)
('geo6', 'Types of angles', 1),
('geo6', 'Measuring angles', 2),
('geo6', 'Drawing angles', 3),
('geo6', 'Angle facts', 4),

-- Geometry - Angle Calculations (geo7)
('geo7', 'Angles on a line', 1),
('geo7', 'Angles around a point', 2),
('geo7', 'Angles in triangles', 3),
('geo7', 'Angles in quadrilaterals', 4),

-- Geometry - Coordinates and Transformations (geo8)
('geo8', 'Four quadrants', 1),
('geo8', 'Plotting points', 2),
('geo8', 'Translations', 3),
('geo8', 'Reflections', 4),

-- Measurement - Metric Units (meas1)
('meas1', 'Length units', 1),
('meas1', 'Mass units', 2),
('meas1', 'Capacity units', 3),
('meas1', 'Converting units', 4),

-- Measurement - Imperial Units (meas2)
('meas2', 'Common imperial units', 1),
('meas2', 'Metric to imperial', 2),
('meas2', 'Real-life contexts', 3),
('meas2', 'Estimation', 4),

-- Measurement - Time (meas3)
('meas3', '24-hour clock', 1),
('meas3', 'Time calculations', 2),
('meas3', 'Timetables', 3),
('meas3', 'Duration problems', 4),

-- Measurement - Speed, Distance, Time (meas4)
('meas4', 'Understanding speed', 1),
('meas4', 'Calculating distance', 2),
('meas4', 'Calculating time', 3),
('meas4', 'Average speed', 4),

-- Statistics - Data Representation (stat1)
('stat1', 'Bar charts', 1),
('stat1', 'Pictograms', 2),
('stat1', 'Line graphs', 3),
('stat1', 'Pie charts', 4),

-- Statistics - Averages (stat2)
('stat2', 'Mean', 1),
('stat2', 'Median', 2),
('stat2', 'Mode', 3),
('stat2', 'Range', 4),

-- Statistics - Data Analysis (stat3)
('stat3', 'Interpreting data', 1),
('stat3', 'Comparing datasets', 2),
('stat3', 'Two-way tables', 3),
('stat3', 'Drawing conclusions', 4),

-- Statistics - Probability (stat4)
('stat4', 'Probability scale', 1),
('stat4', 'Simple probability', 2),
('stat4', 'Experimental probability', 3),
('stat4', 'Probability problems', 4),

-- Problem Solving Strategies - Word Problems (ps1)
('ps1', 'Understanding the question', 1),
('ps1', 'Choosing operations', 2),
('ps1', 'Multi-step problems', 3),
('ps1', 'Checking answers', 4),

-- Problem Solving Strategies - Working Backwards (ps2)
('ps2', 'Inverse operations', 1),
('ps2', 'Finding starting values', 2),
('ps2', 'Missing number problems', 3),
('ps2', 'Algebraic thinking', 4),

-- Problem Solving Strategies - Pattern Problems (ps3)
('ps3', 'Number patterns', 1),
('ps3', 'Shape patterns', 2),
('ps3', 'Growing patterns', 3),
('ps3', 'Finding rules', 4),

-- Problem Solving Strategies - Logic Puzzles (ps4)
('ps4', 'Deduction problems', 1),
('ps4', 'Grid logic', 2),
('ps4', 'Code breaking', 3),
('ps4', 'Mathematical reasoning', 4),

-- Exam Technique - Time Management (ex1)
('ex1', 'Question prioritization', 1),
('ex1', 'Time per question', 2),
('ex1', 'Moving on strategies', 3),
('ex1', 'Final checking', 4),

-- Exam Technique - Common Mistakes (ex2)
('ex2', 'Calculation errors', 1),
('ex2', 'Reading errors', 2),
('ex2', 'Unit errors', 3),
('ex2', 'Checking methods', 4),

-- Exam Technique - Mental Strategies (ex3)
('ex3', 'Estimation', 1),
('ex3', 'Number bonds', 2),
('ex3', 'Quick calculations', 3),
('ex3', 'Pattern recognition', 4),

-- Exam Technique - Mock Exams (ex4)
('ex4', 'GL style papers', 1),
('ex4', 'CEM style papers', 2),
('ex4', 'ISEB style papers', 3),
('ex4', 'Mixed papers', 4);