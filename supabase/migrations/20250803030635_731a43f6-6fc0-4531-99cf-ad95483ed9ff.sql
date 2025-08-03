-- First, add the exam_board column to the existing table
ALTER TABLE bootcamp_misconceptions_catalog 
ADD COLUMN IF NOT EXISTS exam_board text;

-- Clear existing data
DELETE FROM bootcamp_misconceptions_catalog;

-- Insert the new misconception data
INSERT INTO bootcamp_misconceptions_catalog (
    exam_board, misconception_id, misconception_name, description, 
    common_indicators, remediation_strategy, related_topics, category
) VALUES 
-- Place Value misconceptions
('GL', 'PV1', 'Decimal place value confusion', 'Student thinks 0.5 > 0.05 because ''5 is bigger than 05'' or misaligns decimal points', 
 ARRAY['comparing decimal digits individually', 'ignoring decimal point position', '0.5 > 0.05 errors'], 
 'Use place value grids specifically for decimals and visual number lines', 
 ARRAY['decimals', 'place_value', 'comparison', 'ordering'], 'place_value'),

('GL', 'PV2', 'Zero placeholder misunderstanding', 'Student writes 2005 as 25 or doesn''t understand zero''s role in place value', 
 ARRAY['dropping zeros from numbers', '2005 written as 25', 'place value gaps'], 
 'Emphasize zero''s role as placeholder using expanded form exercises', 
 ARRAY['place_value', 'large_numbers', 'zero', 'number_writing'], 'place_value'),

('GL', 'PV3', 'Negative number ordering errors', 'Student thinks -5 > -3 because 5 > 3, ignoring negative signs', 
 ARRAY['ordering negatives like positives', '-5 > -3 type errors', 'ignoring negative signs'], 
 'Use number lines and temperature contexts to show negative number relationships', 
 ARRAY['negative_numbers', 'ordering', 'comparison', 'number_line'], 'place_value'),

('GL', 'PV4', 'Rounding direction errors', 'Student always rounds down or incorrectly rounds 0.5 cases', 
 ARRAY['always rounding down', '2.5 rounded to 2', 'inconsistent rounding rules'], 
 'Practice rounding rules with number line visualization and systematic rule application', 
 ARRAY['rounding', 'decimals', 'approximation', 'number_line'], 'place_value'),

('GL', 'PV5', 'Large number reading errors', 'Student misreads 1,234,567 as ''one million, two hundred thirty-four thousand, five sixty-seven''', 
 ARRAY['incorrect place value naming', 'mixing up thousands/millions', 'reading individual digits'], 
 'Break large numbers into groups and practice systematic place value identification', 
 ARRAY['large_numbers', 'place_value', 'number_names', 'reading_numbers'], 'place_value'),

('CEM', 'PV6', 'Place value in operations breakdown', 'Student makes errors when regrouping across multiple place values in complex calculations', 
 ARRAY['regrouping errors', 'lost track in multi-digit operations', 'place value confusion in algorithms'], 
 'Use expanded form during calculations and systematic column organization', 
 ARRAY['place_value', 'algorithms', 'regrouping', 'multi_digit_operations'], 'place_value'),

('CEM', 'PV7', 'Scientific notation conversion errors', 'Student breaks down when converting between standard and scientific notation in word problems', 
 ARRAY['incorrect power of 10', 'decimal point misplacement', 'notation format confusion'], 
 'Practice step-by-step conversion process with real-world contexts', 
 ARRAY['scientific_notation', 'powers_of_10', 'place_value', 'large_numbers'], 'place_value'),

('CEM', 'PV8', 'Estimation strategy breakdown', 'Student uses inappropriate estimation strategies for multi-step problems', 
 ARRAY['poor estimation choices', 'unreasonable final answers', 'inappropriate rounding timing'], 
 'Teach when and how to estimate at different problem stages', 
 ARRAY['estimation', 'rounding', 'problem_solving', 'reasonableness'], 'place_value'),

('CEM', 'PV9', 'Number system transitions', 'Student shows confusion when problems require switching between fractions, decimals, and percentages', 
 ARRAY['conversion errors', 'format switching mistakes', 'context confusion'], 
 'Practice systematic conversion methods and equivalence recognition', 
 ARRAY['fractions', 'decimals', 'percentages', 'equivalence', 'conversion'], 'place_value'),

('CEM', 'PV10', 'Scale factor misapplication', 'Student makes errors in scaling numbers up/down in proportional reasoning contexts', 
 ARRAY['incorrect scaling', 'proportion errors', 'ratio mistakes in scaling'], 
 'Use visual models and systematic scaling practice with real contexts', 
 ARRAY['scaling', 'proportion', 'ratio', 'multiplication', 'division'], 'place_value'),

-- Fractions misconceptions
('GL', 'FR1', 'Fraction comparison without common denominators', 'Student thinks 3/5 < 2/7 by comparing numerators and denominators separately', 
 ARRAY['comparing numerators only', 'comparing denominators only', 'ignoring fraction size'], 
 'Use visual fraction models and common denominator method for comparisons', 
 ARRAY['fractions', 'comparison', 'common_denominators', 'fraction_size'], 'fractions'),

('GL', 'FR2', 'Decimal-fraction equivalence errors', 'Student doesn''t recognize 0.25 = 1/4 or miscalculates simple conversions', 
 ARRAY['incorrect decimal-fraction conversions', 'not recognizing common equivalents', 'calculation errors in conversion'], 
 'Memorize common equivalents and practice systematic conversion methods', 
 ARRAY['decimals', 'fractions', 'equivalence', 'conversion', 'common_fractions'], 'fractions'),

('GL', 'FR3', 'Percentage as ''out of 100'' confusion', 'Student thinks 25% of 200 = 25 instead of understanding percentage as a ratio', 
 ARRAY['treating % as absolute value', 'ignoring the ''of'' in percentage problems', '25% of 200 = 25'], 
 'Emphasize percentage as ratio and practice ''percentage of'' calculations', 
 ARRAY['percentages', 'ratio', 'proportion', 'multiplication', 'of'], 'fractions'),

('GL', 'FR4', 'Mixed number operations errors', 'Student adds 2¾ + 1½ as (2+1) + (¾+½) = 3 + 1¼ instead of proper conversion', 
 ARRAY['adding whole and fractional parts incorrectly', 'improper fraction handling', 'mixed number algorithm errors'], 
 'Convert to improper fractions first or use visual models for mixed numbers', 
 ARRAY['mixed_numbers', 'fraction_addition', 'improper_fractions', 'conversion'], 'fractions'),

('GL', 'FR5', 'Recurring decimal recognition errors', 'Student doesn''t understand that 0.333... = 1/3 exactly', 
 ARRAY['treating recurring decimals as approximations', 'rounding recurring decimals', 'not recognizing exact equivalence'], 
 'Demonstrate recurring decimal patterns and exact fraction equivalents', 
 ARRAY['recurring_decimals', 'fractions', 'equivalence', 'exact_values'], 'fractions'),

('CEM', 'FR6', 'Cross-format operation chain errors', 'Student makes errors when problems require multiple conversions between fractions, decimals, and percentages', 
 ARRAY['lost in conversion chains', 'format switching errors', 'accumulated conversion mistakes'], 
 'Practice systematic conversion sequences and maintain format consistency where possible', 
 ARRAY['fractions', 'decimals', 'percentages', 'conversion', 'multi_step'], 'fractions'),

('CEM', 'FR7', 'Proportional reasoning with fractions breakdown', 'Student breaks down when fractions are embedded in ratio/proportion problems', 
 ARRAY['fraction proportion errors', 'ratio with fractions confusion', 'complex fraction relationships'], 
 'Use visual models to show fraction relationships within proportional contexts', 
 ARRAY['fractions', 'proportion', 'ratio', 'relationships', 'visual_models'], 'fractions'),

('CEM', 'FR8', 'Compound percentage calculation errors', 'Student makes errors in percentage increases/decreases applied sequentially', 
 ARRAY['additive instead of multiplicative', 'compound interest errors', 'sequential percentage mistakes'], 
 'Practice step-by-step compound calculations and multiplicative nature of percentages', 
 ARRAY['percentages', 'compound_interest', 'sequential_operations', 'multiplicative_thinking'], 'fractions'),

('CEM', 'FR9', 'Fraction of fraction problems confusion', 'Student shows confusion in problems like ''What is 2/3 of 3/4 of 240?''', 
 ARRAY['nested fraction operations', 'multiple ''of'' confusion', 'order of operations with fractions'], 
 'Break down into sequential steps and emphasize ''of'' means multiplication', 
 ARRAY['fractions', 'multiplication', 'of', 'nested_operations', 'word_problems'], 'fractions'),

('CEM', 'FR10', 'Real-world context integration difficulties', 'Student has difficulty applying fraction/decimal knowledge to measurement or money contexts', 
 ARRAY['context switching problems', 'real-world application errors', 'unit confusion with fractions'], 
 'Practice fractions in various real-world contexts with concrete examples', 
 ARRAY['fractions', 'decimals', 'measurement', 'money', 'real_world_applications'], 'fractions'),

-- Operations misconceptions
('GL', 'OP1', 'Operation order errors', 'Student calculates 6 + 2 × 3 as (6+2) × 3 = 24 instead of 6 + 6 = 12', 
 ARRAY['left to right calculation', 'ignoring BIDMAS/BODMAS', 'incorrect bracketing'], 
 'Practice BIDMAS/BODMAS systematically with mnemonics and step-by-step examples', 
 ARRAY['order_of_operations', 'BIDMAS', 'BODMAS', 'brackets', 'multiplication'], 'operations'),

('GL', 'OP2', 'Division remainder confusion', 'Student doesn''t understand when to express remainders as fractions vs whole numbers', 
 ARRAY['inappropriate remainder format', 'context ignoring', 'fraction/whole number confusion'], 
 'Practice determining appropriate remainder format based on problem context', 
 ARRAY['division', 'remainders', 'fractions', 'context', 'interpretation'], 'operations'),

('GL', 'OP3', 'Multiplication by powers of 10 errors', 'Student incorrectly adds zeros when multiplying by powers of 10', 
 ARRAY['adding wrong number of zeros', 'decimal point errors', '×100 = add 2 zeros confusion'], 
 'Emphasize decimal point movement rather than adding zeros', 
 ARRAY['multiplication', 'powers_of_10', 'decimals', 'place_value'], 'operations'),

('GL', 'OP4', 'Subtraction across zeros errors', 'Student makes errors in problems like 1000 - 347 due to borrowing confusion', 
 ARRAY['borrowing errors', 'zero handling problems', 'regrouping confusion'], 
 'Practice systematic borrowing method with place value emphasis', 
 ARRAY['subtraction', 'borrowing', 'regrouping', 'place_value', 'zeros'], 'operations'),

('GL', 'OP5', 'Mental math strategy misapplication', 'Student uses inappropriate mental strategies like trying to double for ×3 problems', 
 ARRAY['wrong strategy choice', 'doubling for ×3', 'inefficient mental methods'], 
 'Teach when to use different mental math strategies and practice strategy selection', 
 ARRAY['mental_math', 'strategies', 'multiplication', 'efficiency'], 'operations'),

('CEM', 'OP6', 'Operation selection in word problems', 'Student chooses wrong operations when context clues are ambiguous', 
 ARRAY['wrong operation choice', 'context misinterpretation', 'keyword over-reliance'], 
 'Practice identifying mathematical relationships rather than relying on keywords', 
 ARRAY['word_problems', 'operation_choice', 'context', 'problem_solving'], 'operations'),

('CEM', 'OP7', 'Multi-step calculation tracking errors', 'Student loses accuracy as calculation chains become longer', 
 ARRAY['accumulating errors', 'lost intermediate steps', 'working memory overload'], 
 'Teach systematic recording of intermediate steps and checking strategies', 
 ARRAY['multi_step', 'calculation', 'organization', 'checking', 'accuracy'], 'operations'),

('CEM', 'OP8', 'Inverse operation understanding confusion', 'Student shows confusion about which operation ''undoes'' another when checking work', 
 ARRAY['wrong inverse operations', 'checking method errors', 'undo operation confusion'], 
 'Practice inverse operations systematically and emphasize checking methods', 
 ARRAY['inverse_operations', 'checking', 'addition', 'subtraction', 'multiplication', 'division'], 'operations'),

('CEM', 'OP9', 'Estimation integration failures', 'Student has poor estimation skills leading to unreasonable final answers', 
 ARRAY['unreasonable answers', 'no estimation checking', 'poor number sense'], 
 'Integrate estimation checks throughout problem-solving process', 
 ARRAY['estimation', 'reasonableness', 'number_sense', 'checking'], 'operations'),

('CEM', 'OP10', 'Pattern recognition in sequences breakdown', 'Student misses arithmetic patterns in number sequences', 
 ARRAY['pattern identification errors', 'sequence continuation mistakes', 'rule finding difficulties'], 
 'Practice systematic pattern identification and rule articulation', 
 ARRAY['patterns', 'sequences', 'arithmetic_sequences', 'rules'], 'operations'),

-- Algebra misconceptions
('GL', 'AL1', 'Variable substitution errors', 'Student calculates 3x + 2 when x = 4 as 3 × 4 + 2 × 4 = 20 instead of 14', 
 ARRAY['distributing variables incorrectly', 'multiplying all terms by variable', 'substitution errors'], 
 'Practice systematic substitution with clear step-by-step replacement', 
 ARRAY['algebra', 'substitution', 'variables', 'expressions'], 'algebra'),

('GL', 'AL2', 'Equation balance errors', 'Student doesn''t maintain equality when manipulating simple equations', 
 ARRAY['unbalanced operations', 'one-sided changes', 'equality misconceptions'], 
 'Use balance scale analogies and emphasize doing same thing to both sides', 
 ARRAY['equations', 'balance', 'equality', 'solving'], 'algebra'),

('GL', 'AL3', 'Pattern rule identification failures', 'Student misses the relationship in sequences like 3, 7, 11, 15...', 
 ARRAY['wrong pattern rules', 'missing differences', 'incorrect next terms'], 
 'Practice finding differences and systematic pattern identification', 
 ARRAY['patterns', 'sequences', 'arithmetic_progression', 'differences'], 'algebra'),

('GL', 'AL4', 'Coordinate reading errors', 'Student confuses x and y coordinates or misreads negative coordinates', 
 ARRAY['x-y confusion', 'negative coordinate errors', 'plotting mistakes'], 
 'Practice systematic coordinate reading with ''along the corridor, up the stairs''', 
 ARRAY['coordinates', 'graphs', 'plotting', 'negative_numbers'], 'algebra'),

('GL', 'AL5', 'Function machine operation confusion', 'Student shows input/output confusion in simple function problems', 
 ARRAY['input-output reversal', 'function operation errors', 'machine direction confusion'], 
 'Use clear input-operation-output diagrams and practice systematic application', 
 ARRAY['functions', 'input_output', 'operations', 'machines'], 'algebra'),

('CEM', 'AL6', 'Multi-variable expression evaluation errors', 'Student makes errors when substituting multiple variables simultaneously', 
 ARRAY['variable mixing', 'simultaneous substitution errors', 'complex expression mistakes'], 
 'Practice one variable at a time substitution before combining', 
 ARRAY['algebra', 'multi_variables', 'substitution', 'expressions'], 'algebra'),

('CEM', 'AL7', 'Algebraic word problem translation errors', 'Student struggles converting complex word problems to algebraic expressions', 
 ARRAY['word to algebra translation errors', 'variable definition problems', 'expression formation mistakes'], 
 'Practice systematic problem deconstruction and variable definition', 
 ARRAY['word_problems', 'algebra', 'translation', 'expressions'], 'algebra'),

('CEM', 'AL8', 'Linear relationship recognition failures', 'Student misses linear patterns in real-world contexts', 
 ARRAY['linear pattern missed', 'relationship identification errors', 'context pattern confusion'], 
 'Practice identifying linear relationships in tables, graphs, and contexts', 
 ARRAY['linear_relationships', 'patterns', 'real_world', 'contexts'], 'algebra'),

('CEM', 'AL9', 'Systematic trial method disorganization', 'Student shows poor organization when using trial and improvement methods', 
 ARRAY['unsystematic trials', 'poor record keeping', 'random guessing'], 
 'Teach organized trial tables and systematic improvement strategies', 
 ARRAY['trial_and_improvement', 'systematic_methods', 'organization'], 'algebra'),

('CEM', 'AL10', 'Graphical pattern integration difficulties', 'Student struggles connecting algebraic patterns with their graphical representations', 
 ARRAY['graph-algebra disconnection', 'pattern visualization problems', 'representation switching errors'], 
 'Practice moving between algebraic and graphical representations systematically', 
 ARRAY['graphs', 'algebra', 'patterns', 'representations', 'visualization'], 'algebra'),

-- Geometry misconceptions
('GL', 'GE1', 'Area vs perimeter confusion', 'Student uses perimeter formula for area calculations or vice versa', 
 ARRAY['wrong formula application', 'area-perimeter mixing', 'measurement confusion'], 
 'Emphasize the difference between ''around'' (perimeter) and ''inside'' (area)', 
 ARRAY['area', 'perimeter', 'measurement', 'formulas'], 'geometry'),

('GL', 'GE2', 'Unit conversion errors', 'Student converts 3m to cm as 30cm instead of 300cm', 
 ARRAY['wrong conversion factors', 'decimal point errors', 'unit confusion'], 
 'Practice conversion factors systematically with visual aids', 
 ARRAY['units', 'conversion', 'measurement', 'metric_system'], 'geometry'),

('GL', 'GE3', 'Angle measurement errors', 'Student misreads protractors or confuses acute/obtuse classifications', 
 ARRAY['protractor reading errors', 'angle classification mistakes', 'degree measurement confusion'], 
 'Practice protractor use and angle classification with clear examples', 
 ARRAY['angles', 'measurement', 'protractor', 'classification'], 'geometry'),

('GL', 'GE4', '3D shape properties confusion', 'Student confuses faces, edges, and vertices in solid shape problems', 
 ARRAY['face-edge-vertex confusion', '3D property errors', 'counting mistakes'], 
 'Use physical models to demonstrate and count 3D shape properties', 
 ARRAY['3D_shapes', 'faces', 'edges', 'vertices', 'properties'], 'geometry'),

('GL', 'GE5', 'Scale drawing interpretation errors', 'Student misunderstands scale ratios like 1:100 vs 1 cm = 100 m', 
 ARRAY['scale ratio confusion', 'scale format mixing', 'proportion errors'], 
 'Practice different scale formats and their applications systematically', 
 ARRAY['scale', 'ratio', 'proportion', 'measurement'], 'geometry'),

('CEM', 'GE6', 'Compound shape area calculation errors', 'Student breaks complex shapes into wrong component parts', 
 ARRAY['wrong shape decomposition', 'area calculation errors', 'component identification mistakes'], 
 'Practice systematic shape decomposition and area addition/subtraction', 
 ARRAY['area', 'compound_shapes', 'decomposition', 'calculation'], 'geometry'),

('CEM', 'GE7', 'Measurement chain problem errors', 'Student accumulates errors through multiple unit conversions', 
 ARRAY['conversion chain errors', 'accumulated mistakes', 'multi-step conversion problems'], 
 'Practice systematic conversion chains with checking at each step', 
 ARRAY['measurement', 'conversion', 'multi_step', 'units'], 'geometry'),

('CEM', 'GE8', 'Geometric relationship application errors', 'Student uses wrong geometric properties in proof-style problems', 
 ARRAY['property misapplication', 'geometric reasoning errors', 'proof logic mistakes'], 
 'Practice identifying and applying relevant geometric properties systematically', 
 ARRAY['geometry', 'properties', 'relationships', 'proofs'], 'geometry'),

('CEM', 'GE9', 'Spatial reasoning integration difficulties', 'Student has difficulty visualizing 3D objects from 2D representations', 
 ARRAY['3D visualization problems', '2D-3D conversion errors', 'spatial relationship confusion'], 
 'Use physical models and systematic 2D-3D visualization practice', 
 ARRAY['spatial_reasoning', '3D_visualization', '2D_representations'], 'geometry'),

('CEM', 'GE10', 'Real-world measurement problem difficulties', 'Student struggles applying measurement knowledge to practical contexts', 
 ARRAY['context application errors', 'practical measurement mistakes', 'real-world connection failures'], 
 'Practice measurement in varied real-world contexts with hands-on activities', 
 ARRAY['measurement', 'real_world', 'applications', 'practical_contexts'], 'geometry'),

-- Data misconceptions
('GL', 'DA1', 'Mean vs median confusion', 'Student uses wrong measure of average for given contexts', 
 ARRAY['average type confusion', 'mean-median mixing', 'inappropriate average choice'], 
 'Practice when to use different averages and their calculation methods', 
 ARRAY['averages', 'mean', 'median', 'statistics'], 'data'),

('GL', 'DA2', 'Graph reading errors', 'Student misreads scales or interpolates between points incorrectly', 
 ARRAY['scale reading errors', 'interpolation mistakes', 'graph misinterpretation'], 
 'Practice systematic graph reading and scale interpretation', 
 ARRAY['graphs', 'scales', 'reading', 'interpretation'], 'data'),

('GL', 'DA3', 'Probability as percentage confusion', 'Student expresses probability as percentage without understanding the relationship', 
 ARRAY['probability-percentage confusion', 'format mixing', 'scale misunderstanding'], 
 'Practice converting between probability formats and understanding scales', 
 ARRAY['probability', 'percentages', 'fractions', 'scales'], 'data'),

('GL', 'DA4', 'Data interpretation errors', 'Student draws wrong conclusions from simple charts and graphs', 
 ARRAY['wrong conclusions', 'data misinterpretation', 'chart reading errors'], 
 'Practice systematic data analysis and conclusion drawing', 
 ARRAY['data_interpretation', 'charts', 'graphs', 'conclusions'], 'data'),

('GL', 'DA5', 'Range calculation errors', 'Student includes/excludes endpoints incorrectly or confuses range with other measures', 
 ARRAY['range calculation mistakes', 'endpoint confusion', 'statistical measure mixing'], 
 'Practice range calculation with clear highest minus lowest method', 
 ARRAY['range', 'statistics', 'calculation', 'measures'], 'data'),

('CEM', 'DA6', 'Statistical measure integration difficulties', 'Student struggles combining multiple statistical measures in complex problems', 
 ARRAY['measure combination errors', 'statistical integration mistakes', 'complex analysis problems'], 
 'Practice using multiple statistical measures together systematically', 
 ARRAY['statistics', 'multiple_measures', 'integration', 'analysis'], 'data'),

('CEM', 'DA7', 'Data collection bias recognition failures', 'Student doesn''t understand how data collection methods affect results', 
 ARRAY['bias recognition failures', 'method impact ignorance', 'sampling errors'], 
 'Practice identifying bias in different data collection scenarios', 
 ARRAY['data_collection', 'bias', 'sampling', 'methods'], 'data'),

('CEM', 'DA8', 'Probability tree diagram errors', 'Student makes errors in multi-stage probability calculations', 
 ARRAY['tree diagram mistakes', 'multi-stage probability errors', 'branch calculation problems'], 
 'Practice systematic tree diagram construction and probability calculation', 
 ARRAY['probability', 'tree_diagrams', 'multi_stage', 'calculations'], 'data'),

('CEM', 'DA9', 'Graph construction from data errors', 'Student creates inappropriate graphs for different data types', 
 ARRAY['wrong graph types', 'inappropriate representations', 'construction errors'], 
 'Practice choosing appropriate graph types for different data types', 
 ARRAY['graphs', 'construction', 'data_types', 'representation'], 'data'),

('CEM', 'DA10', 'Statistical reasoning in context difficulties', 'Student struggles applying statistical knowledge to real-world decision making', 
 ARRAY['context application errors', 'real-world reasoning problems', 'decision making difficulties'], 
 'Practice statistical reasoning in varied real-world contexts', 
 ARRAY['statistics', 'real_world', 'reasoning', 'decision_making'], 'data');