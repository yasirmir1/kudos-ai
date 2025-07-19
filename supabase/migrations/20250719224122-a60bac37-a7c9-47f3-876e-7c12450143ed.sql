-- Insert Year 4-5 curriculum data
INSERT INTO curriculum (
    question_id, topic, subtopic, example_question, question_type, 
    options, correct_answer, difficulty, red_herring_tag, 
    red_herring_explanation, pedagogical_notes, age_group, year_level
) VALUES 
-- Year 4 Questions (Foundation Level)
('Y4NPV001', 'Number - Number and Place Value', 'Count in multiples of 6, 7, 9, 25 and 1000', 'Count on in 25s from 150. What comes next: 150, 175, 200, __?', 'Multiple Choice', '["225", "250", "215", "300"]', '225', 'Easy', NULL, NULL, 'Year 4: Skip counting by 25s.', 'year 4-5', 4),

('Y4NPV002', 'Number - Number and Place Value', 'Recognise the place value of each digit in a four-digit number', 'What is the value of the digit 7 in the number 3,746?', 'Multiple Choice', '["700", "7", "70", "7000"]', '700', 'Medium', '["PlaceValue_PositionError"]', 'Student may identify the wrong place value position (70 for tens or 7 for ones).', 'Year 4: Understanding hundreds place in 4-digit numbers.', 'year 4-5', 4),

('Y4NPV003', 'Number - Number and Place Value', 'Count backwards through zero to include negative numbers', 'Continue the sequence: 3, 1, -1, __', 'Multiple Choice', '["-3", "-2", "0", "-4"]', '-3', 'Medium', '["NegativeNumbers_PatternError"]', 'Student may not recognize the pattern of subtracting 2 each time.', 'Year 4: Counting backwards through zero.', 'year 4-5', 4),

('Y4NPV004', 'Number - Number and Place Value', 'Round any number to the nearest 10, 100 or 1000', 'Round 4,567 to the nearest hundred.', 'Multiple Choice', '["4,600", "4,500", "4,570", "5,000"]', '4,600', 'Medium', '["Rounding_DirectionError"]', 'Student may round down to 4,500 instead of up to 4,600.', 'Year 4: Rounding to nearest hundred.', 'year 4-5', 4),

('Y4ASM001', 'Number - Addition and Subtraction', 'Add and subtract numbers with up to 4 digits using formal written methods', 'Calculate: 3,456 + 1,789', 'Multiple Choice', '["5,245", "4,245", "5,235", "5,145"]', '5,245', 'Medium', '["Addition_CarryingError"]', 'Student may make errors when carrying over between columns.', 'Year 4: 4-digit addition with carrying.', 'year 4-5', 4),

('Y4ASM002', 'Number - Addition and Subtraction', 'Solve addition and subtraction two-step problems in contexts', 'A school had 1,234 books. They bought 256 more books and then gave away 189 books. How many books do they have now?', 'Multiple Choice', '["1,301", "1,679", "1,290", "1,401"]', '1,301', 'Hard', '["MultiStep_SequenceError"]', 'Student may add all numbers (1,679) instead of adding then subtracting.', 'Year 4: Two-step word problem with addition and subtraction.', 'year 4-5', 4),

('Y4MD001', 'Number - Multiplication and Division', 'Recall multiplication and division facts for multiplication tables up to 12 × 12', 'What is 7 × 8?', 'Multiple Choice', '["56", "54", "48", "63"]', '56', 'Medium', '["Multiplication_NearbyFact"]', 'Student may confuse with nearby facts like 6×8=48 or 7×9=63.', 'Year 4: Multiplication facts up to 12×12.', 'year 4-5', 4),

('Y4MD002', 'Number - Multiplication and Division', 'Multiply two-digit and three-digit numbers by a one-digit number', 'Calculate: 234 × 6', 'Multiple Choice', '["1,404", "1,304", "1,444", "1,204"]', '1,404', 'Hard', '["Multiplication_CarryError"]', 'Student may make errors when carrying in multi-digit multiplication.', 'Year 4: Three-digit by one-digit multiplication.', 'year 4-5', 4),

('Y4FR001', 'Number - Fractions (including decimals)', 'Recognise and show families of common equivalent fractions', 'Which fraction is equivalent to 3/6?', 'Multiple Choice', '["1/2", "2/3", "3/4", "1/3"]', '1/2', 'Medium', '["Fractions_SimplificationError"]', 'Student may not simplify correctly or recognize equivalence.', 'Year 4: Finding equivalent fractions through simplification.', 'year 4-5', 4),

('Y4FR002', 'Number - Fractions (including decimals)', 'Count up and down in hundredths', 'What is 0.47 + 0.03?', 'Multiple Choice', '["0.50", "0.44", "0.77", "0.5"]', '0.50', 'Medium', '["Decimals_PlaceValueError"]', 'Student may add digits incorrectly (4+3=7, giving 0.77).', 'Year 4: Adding hundredths to cross a tenth boundary.', 'year 4-5', 4),

('Y4FR003', 'Number - Fractions (including decimals)', 'Add and subtract fractions with the same denominator', 'Calculate: 3/8 + 2/8', 'Multiple Choice', '["5/8", "5/16", "1/8", "6/8"]', '5/8', 'Easy', '["Fractions_DenominatorAddition"]', 'Student may incorrectly add denominators (8+8=16).', 'Year 4: Adding fractions with same denominator.', 'year 4-5', 4),

('Y4FR004', 'Number - Fractions (including decimals)', 'Recognise and write decimal equivalents of 1/4, 1/2, 3/4', 'What is 3/4 as a decimal?', 'Multiple Choice', '["0.75", "0.34", "0.25", "0.3"]', '0.75', 'Medium', '["FractionDecimal_ConversionError"]', 'Student may write digits from fraction (0.34) instead of converting.', 'Year 4: Converting common fractions to decimals.', 'year 4-5', 4),

('Y4ME001', 'Measurement', 'Convert between different units of measure', 'How many metres are in 3 kilometres?', 'Multiple Choice', '["3,000", "300", "30", "30,000"]', '3,000', 'Medium', '["Conversion_FactorError"]', 'Student may use wrong conversion factor (×100 instead of ×1000).', 'Year 4: Converting kilometres to metres.', 'year 4-5', 4),

('Y4ME002', 'Measurement', 'Measure and calculate the perimeter of a rectilinear figure', 'A rectangle has length 8cm and width 5cm. What is its perimeter?', 'Multiple Choice', '["26cm", "13cm", "40cm", "21cm"]', '26cm', 'Medium', '["Perimeter_FormulaError"]', 'Student may only add length and width once (13cm) or calculate area (40cm²).', 'Year 4: Calculating rectangle perimeter.', 'year 4-5', 4),

('Y4ME003', 'Measurement', 'Find the area of rectilinear shapes by counting squares', 'A rectangle drawn on squared paper covers 15 squares. What is its area?', 'Multiple Choice', '["15 square units", "15 units", "30 square units", "60 square units"]', '15 square units', 'Easy', '["Area_UnitError"]', 'Student may forget to include ''square'' in units.', 'Year 4: Understanding area by counting squares.', 'year 4-5', 4),

('Y4GS001', 'Geometry - Properties of Shapes', 'Compare and classify geometric shapes, including quadrilaterals and triangles', 'Which type of triangle has all sides of different lengths?', 'Multiple Choice', '["Scalene", "Isosceles", "Equilateral", "Right-angled"]', 'Scalene', 'Medium', '["Triangle_TypeConfusion"]', 'Student may confuse triangle classifications.', 'Year 4: Identifying triangle types by side lengths.', 'year 4-5', 4),

('Y4GS002', 'Geometry - Properties of Shapes', 'Identify acute and obtuse angles', 'What type of angle is greater than 90° but less than 180°?', 'Multiple Choice', '["Obtuse", "Acute", "Right", "Reflex"]', 'Obtuse', 'Medium', '["Angle_TypeConfusion"]', 'Student may confuse obtuse with acute (less than 90°).', 'Year 4: Classifying angles by size.', 'year 4-5', 4),

('Y4GS003', 'Geometry - Properties of Shapes', 'Identify lines of symmetry in 2-D shapes', 'How many lines of symmetry does a square have?', 'Multiple Choice', '["4", "2", "1", "8"]', '4', 'Medium', '["Symmetry_CountError"]', 'Student may only count horizontal and vertical lines (2).', 'Year 4: Finding all lines of symmetry in regular shapes.', 'year 4-5', 4),

('Y4PD001', 'Geometry - Position and Direction', 'Describe positions on a 2-D grid as coordinates in the first quadrant', 'What are the coordinates of a point that is 3 units right and 2 units up from the origin?', 'Multiple Choice', '["(3, 2)", "(2, 3)", "(3, -2)", "(-3, 2)"]', '(3, 2)', 'Medium', '["Coordinates_OrderError"]', 'Student may reverse x and y coordinates (2, 3).', 'Year 4: Understanding coordinate notation (x, y).', 'year 4-5', 4),

('Y4PD002', 'Geometry - Position and Direction', 'Describe movements between positions as translations', 'A shape at position (2, 3) moves 4 units right. What is its new position?', 'Multiple Choice', '["(6, 3)", "(2, 7)", "(4, 3)", "(2, -1)"]', '(6, 3)', 'Hard', '["Translation_DirectionError"]', 'Student may move up instead of right (2, 7) or only count to 4.', 'Year 4: Understanding horizontal translation on coordinate grid.', 'year 4-5', 4),

('Y4ST001', 'Statistics', 'Interpret and present discrete and continuous data using appropriate graphical methods', 'A bar chart shows the favorite colors of 30 students. If 12 chose blue and 8 chose red, how many chose other colors?', 'Multiple Choice', '["10", "20", "4", "30"]', '10', 'Medium', '["Statistics_SubtractionError"]', 'Student may add instead of subtract, or find difference between blue and red.', 'Year 4: Interpreting data from bar charts.', 'year 4-5', 4),

('Y4ST002', 'Statistics', 'Solve comparison, sum and difference problems using information presented in bar charts', 'In a bar chart, Team A scored 45 points and Team B scored 30 points. How many more points did Team A score?', 'Multiple Choice', '["15", "75", "30", "45"]', '15', 'Easy', '["Statistics_ComparisonError"]', 'Student may add scores (75) instead of finding difference.', 'Year 4: Finding differences in data.', 'year 4-5', 4),

-- Year 5 Questions (Advanced Level)
('Y5NPV001', 'Number - Number and Place Value', 'Read, write, order and compare numbers to at least 1,000,000', 'Which number is larger: 456,789 or 456,879?', 'Multiple Choice', '["456,879", "456,789", "They are equal", "Cannot tell"]', '456,879', 'Medium', '["LargeNumber_DigitPositionError"]', 'Student may compare wrong place values in large numbers.', 'Year 5: Comparing 6-digit numbers.', 'year 4-5', 5),

('Y5NPV002', 'Number - Number and Place Value', 'Count forwards or backwards in steps of powers of 10', 'What is 34,500 + 1,000?', 'Multiple Choice', '["35,500", "34,600", "44,500", "34,510"]', '35,500', 'Easy', '["PowersOf10_PlaceValueError"]', 'Student may add to wrong place value column.', 'Year 5: Adding powers of 10.', 'year 4-5', 5),

('Y5NPV003', 'Number - Number and Place Value', 'Interpret negative numbers in context, count forwards and backwards with positive and negative whole numbers', 'The temperature is -5°C. It rises by 8°C. What is the new temperature?', 'Multiple Choice', '["3°C", "-13°C", "13°C", "-3°C"]', '3°C', 'Medium', '["NegativeNumbers_OperationError"]', 'Student may subtract instead of add (-5-8=-13) or mishandle crossing zero.', 'Year 5: Working with negative numbers in context.', 'year 4-5', 5),

('Y5NPV004', 'Number - Number and Place Value', 'Round any number up to 1,000,000 to the nearest 10, 100, 1000, 10,000 and 100,000', 'Round 654,321 to the nearest 10,000.', 'Multiple Choice', '["650,000", "660,000", "654,000", "700,000"]', '650,000', 'Hard', '["Rounding_LargePlaceValue"]', 'Student may round to wrong place value or round up incorrectly.', 'Year 5: Rounding large numbers to ten thousands.', 'year 4-5', 5),

('Y5ASM001', 'Number - Addition and Subtraction', 'Add and subtract whole numbers with more than 4 digits', 'Calculate: 45,678 - 17,892', 'Multiple Choice', '["27,786", "28,786", "27,886", "63,570"]', '27,786', 'Medium', '["Subtraction_BorrowingError"]', 'Student may make errors when borrowing across multiple columns.', 'Year 5: 5-digit subtraction with borrowing.', 'year 4-5', 5),

('Y5ASM002', 'Number - Addition and Subtraction', 'Solve addition and subtraction multi-step problems in contexts', 'A company had £45,600. They received £12,350 in sales, paid £8,900 in wages, and spent £5,750 on supplies. How much money do they have now?', 'Multiple Choice', '["£43,300", "£72,600", "£38,300", "£42,300"]', '£43,300', 'Very Hard', '["MultiStep_OrderOfOperations"]', 'Student may add all positive amounts and subtract negatives incorrectly.', 'Year 5: Complex multi-step problem with money.', 'year 4-5', 5),

('Y5MD001', 'Number - Multiplication and Division', 'Multiply numbers up to 4 digits by a one- or two-digit number using formal written method', 'Calculate: 1,234 × 25', 'Multiple Choice', '["30,850", "28,850", "31,850", "25,850"]', '30,850', 'Very Hard', '["LongMultiplication_PartialProductError"]', 'Student may make errors when adding partial products in long multiplication.', 'Year 5: Long multiplication with 4-digit by 2-digit numbers.', 'year 4-5', 5),

('Y5MD002', 'Number - Multiplication and Division', 'Divide numbers up to 4 digits by a one-digit number and interpret remainders', 'Calculate: 725 ÷ 6', 'Multiple Choice', '["120 remainder 5", "121 remainder 1", "120 remainder 3", "125"]', '120 remainder 5', 'Hard', '["Division_RemainderError"]', 'Student may calculate remainder incorrectly or forget to include it.', 'Year 5: Division with remainders.', 'year 4-5', 5),

('Y5MD003', 'Number - Multiplication and Division', 'Identify multiples and factors, including finding all factor pairs', 'Which of these is NOT a factor of 24?', 'Multiple Choice', '["5", "6", "8", "3"]', '5', 'Medium', '["Factors_NonFactorConfusion"]', 'Student may not check if number divides evenly into 24.', 'Year 5: Identifying factors of numbers.', 'year 4-5', 5),

('Y5MD004', 'Number - Multiplication and Division', 'Know and use the vocabulary of prime numbers, prime factors and composite numbers', 'Which of these is a prime number?', 'Multiple Choice', '["17", "15", "21", "27"]', '17', 'Medium', '["PrimeNumbers_OddNumberConfusion"]', 'Student may think all odd numbers are prime.', 'Year 5: Identifying prime numbers.', 'year 4-5', 5),

('Y5FR001', 'Number - Fractions (including decimals and percentages)', 'Compare and order fractions whose denominators are multiples of the same number', 'Which is larger: 2/3 or 5/6?', 'Multiple Choice', '["5/6", "2/3", "They are equal", "Cannot tell"]', '5/6', 'Hard', '["FractionComparison_CommonDenominator"]', 'Student may not find common denominator to compare (2/3 = 4/6).', 'Year 5: Comparing fractions with related denominators.', 'year 4-5', 5),

('Y5FR002', 'Number - Fractions (including decimals and percentages)', 'Recognise mixed numbers and improper fractions and convert from one form to the other', 'Convert 7/4 to a mixed number.', 'Multiple Choice', '["1 3/4", "3 1/4", "1 4/7", "7 1/4"]', '1 3/4', 'Medium', '["MixedNumber_ConversionError"]', 'Student may invert the fraction or calculate whole number incorrectly.', 'Year 5: Converting improper fractions to mixed numbers.', 'year 4-5', 5),

('Y5FR003', 'Number - Fractions (including decimals and percentages)', 'Add and subtract fractions with denominators that are multiples of the same number', 'Calculate: 1/2 + 1/4', 'Multiple Choice', '["3/4", "2/6", "1/6", "2/4"]', '3/4', 'Medium', '["Fractions_UnlikeAddition"]', 'Student may add numerators and denominators directly (1+1=2, 2+4=6).', 'Year 5: Adding fractions with different but related denominators.', 'year 4-5', 5),

('Y5FR004', 'Number - Fractions (including decimals and percentages)', 'Multiply proper fractions and mixed numbers by whole numbers', 'Calculate: 3/4 × 2', 'Multiple Choice', '["1 1/2", "3/8", "6/4", "3/2"]', '1 1/2', 'Hard', '["FractionMultiplication_WholeNumber"]', 'Student may divide instead of multiply or not convert to mixed number.', 'Year 5: Multiplying fractions by whole numbers.', 'year 4-5', 5),

('Y5FR005', 'Number - Fractions (including decimals and percentages)', 'Recognise the per cent symbol (%) and understand that per cent relates to ''number of parts per hundred''', 'What is 25% as a fraction?', 'Multiple Choice', '["1/4", "1/25", "25/10", "2/5"]', '1/4', 'Medium', '["Percentage_FractionConversion"]', 'Student may write 1/25 thinking percent means ''out of'' the number.', 'Year 5: Converting percentages to fractions.', 'year 4-5', 5),

('Y5FR006', 'Number - Fractions (including decimals and percentages)', 'Solve problems which require knowing percentage and decimal equivalents', 'What is 20% of 60?', 'Multiple Choice', '["12", "20", "40", "3"]', '12', 'Hard', '["Percentage_CalculationError"]', 'Student may divide 60 by 20 (=3) or subtract 20 from 60 (=40).', 'Year 5: Finding percentages of amounts.', 'year 4-5', 5),

('Y5ME001', 'Measurement', 'Convert between different units of metric measure', 'Convert 2.5kg to grams.', 'Multiple Choice', '["2,500g", "250g", "25g", "25,000g"]', '2,500g', 'Medium', '["MetricConversion_DecimalError"]', 'Student may misplace decimal when converting (250g).', 'Year 5: Converting kilograms to grams with decimals.', 'year 4-5', 5),

('Y5ME002', 'Measurement', 'Calculate and compare the area of rectangles using standard units', 'A rectangle has length 12cm and width 7cm. What is its area?', 'Multiple Choice', '["84 cm²", "19 cm²", "38 cm²", "84 cm"]', '84 cm²', 'Medium', '["Area_PerimeterConfusion"]', 'Student may calculate perimeter (38cm) instead of area, or add dimensions.', 'Year 5: Calculating area of rectangles.', 'year 4-5', 5),

('Y5ME003', 'Measurement', 'Estimate volume and capacity', 'A cube has sides of 3cm. What is its volume?', 'Multiple Choice', '["27 cm³", "9 cm³", "18 cm³", "12 cm³"]', '27 cm³', 'Hard', '["Volume_AreaConfusion"]', 'Student may calculate area of one face (9 cm²) or perimeter instead.', 'Year 5: Calculating volume of cubes.', 'year 4-5', 5),

('Y5GS001', 'Geometry - Properties of Shapes', 'Identify 3-D shapes from 2-D representations', 'Which 3-D shape has 6 square faces?', 'Multiple Choice', '["Cube", "Cuboid", "Pyramid", "Sphere"]', 'Cube', 'Easy', '["3DShape_PropertyError"]', 'Student may confuse cube with cuboid (rectangular faces).', 'Year 5: Identifying 3D shapes by properties.', 'year 4-5', 5),

('Y5GS002', 'Geometry - Properties of Shapes', 'Know angles are measured in degrees; estimate and compare acute, obtuse and reflex angles', 'What is the size of a right angle in degrees?', 'Multiple Choice', '["90°", "180°", "45°", "360°"]', '90°', 'Easy', NULL, NULL, 'Year 5: Basic angle measurements.', 'year 4-5', 5),

('Y5GS003', 'Geometry - Properties of Shapes', 'Identify angles at a point and one whole turn (total 360°)', 'Three angles at a point measure 120°, 80°, and one unknown angle. What is the unknown angle?', 'Multiple Choice', '["160°", "200°", "140°", "180°"]', '160°', 'Hard', '["AngleSum_CalculationError"]', 'Student may add given angles incorrectly or subtract from wrong total.', 'Year 5: Finding missing angles at a point.', 'year 4-5', 5),

('Y5GS004', 'Geometry - Properties of Shapes', 'Distinguish between regular and irregular polygons based on reasoning about equal sides and angles', 'Which of these is a regular polygon?', 'Multiple Choice', '["A square", "A rectangle", "A rhombus", "An isosceles triangle"]', 'A square', 'Medium', '["RegularPolygon_Definition"]', 'Student may think any shape with equal sides is regular (rhombus).', 'Year 5: Understanding regular polygons need equal sides AND angles.', 'year 4-5', 5),

('Y5PD001', 'Geometry - Position and Direction', 'Identify, describe and represent the position of a shape following a reflection or translation', 'A triangle with vertex at (2, 5) is reflected in the y-axis. Where is this vertex now?', 'Multiple Choice', '["(-2, 5)", "(2, -5)", "(-2, -5)", "(5, 2)"]', '(-2, 5)', 'Very Hard', '["Reflection_AxisConfusion"]', 'Student may reflect in x-axis (2, -5) or both axes (-2, -5).', 'Year 5: Understanding reflection in y-axis changes x-coordinate sign.', 'year 4-5', 5),

('Y5ST001', 'Statistics', 'Solve comparison, sum and difference problems using information presented in a line graph', 'A line graph shows temperature over 5 days. Monday was 15°C and Friday was 22°C. What was the temperature increase?', 'Multiple Choice', '["7°C", "37°C", "15°C", "22°C"]', '7°C', 'Medium', '["LineGraph_ReadingError"]', 'Student may add temperatures (37°C) or give one of the values.', 'Year 5: Interpreting line graphs to find differences.', 'year 4-5', 5),

('Y5ST002', 'Statistics', 'Complete, read and interpret information in tables, including timetables', 'A train timetable shows a train leaves at 09:45 and arrives at 11:20. How long is the journey?', 'Multiple Choice', '["1 hour 35 minutes", "2 hours 35 minutes", "1 hour 25 minutes", "35 minutes"]', '1 hour 35 minutes', 'Hard', '["Time_DifferenceError"]', 'Student may calculate time difference incorrectly across the hour.', 'Year 5: Reading timetables and calculating time differences.', 'year 4-5', 5)

ON CONFLICT (question_id) DO NOTHING;