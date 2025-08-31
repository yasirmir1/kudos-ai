/**
 * Centralized mapping of misconception codes to parent-friendly descriptions
 * Each label accurately describes what the child is doing wrong
 */

export const MISCONCEPTION_LABELS: Record<string, string> = {
  // Algebra Misconceptions
  'Algebra_IncorrectOperation': 'Mixing up algebra operations (+, -, ×, ÷)',
  'Algebra_IncorrectInverseOperation': 'Using wrong operations to solve equations',
  'Formula_VariableSubstitution': 'Difficulty substituting values into formulas',

  // Arithmetic Operations
  'Addition_CarryError': 'Forgetting to carry numbers when adding',
  'Subtraction_BorrowError': 'Difficulty borrowing when subtracting',
  'Subtraction_CountingError': 'Counting errors in subtraction',
  'Multiplication_TableError': 'Times table mix-ups',
  'Division_RemainderError': 'Handling remainders incorrectly',
  'MultiStep_OperationSequenceError': 'Getting confused with multiple calculation steps',
  'MultiStep_SequenceError': 'Wrong order in multi-step problems',

  // Order of Operations
  'OrderOfOperations_ParenthesesIgnored': 'Forgetting brackets come first',
  'OrderOfOperations_SubtractionBeforeMultiplication': 'Doing subtraction before multiplication',

  // Place Value & Number Understanding
  'PlaceValue_DigitValueConfusion': 'Mixing up what position numbers mean',
  'PlaceValue_OrderingConfusion_ZeroPlacement': 'Trouble with zeros in large numbers',
  'PlaceValue_MisplacedDigits': 'Putting digits in wrong positions',
  'PlaceValue_MisplacedRounding': 'Confusion about which digit to round',
  'PlaceValue_PositionError': 'Not understanding place value positions',
  'PowersOf10_PlaceValueError': 'Difficulty with powers of 10 and place value',

  // Rounding
  'Rounding_IncorrectDirection': 'Rounding the wrong way (up instead of down)',
  'Rounding_DownInsteadOfUp': 'Rounding down when should round up',
  'Rounding_UpInsteadOfDown': 'Rounding up when should round down', 
  'Rounding_DirectionError': 'Confusion about rounding direction',

  // Fractions
  'Fractions_AddNumeratorsAndDenominators': 'Adding top and bottom numbers separately',
  'Fractions_AddNumeratorAndDenominator': 'Adding numerator and denominator together',
  'Fractions_KeepLargerDenominator': 'Using the bigger bottom number in answers',
  'Fractions_MultiplyLikeAddition': 'Multiplying fractions like adding them',
  'Fractions_DenominatorAddition': 'Only adding bottom numbers in fractions',
  'MixedNumbers_ImproperConversion': 'Difficulty converting mixed numbers',
  'MixedNumber_ConversionError': 'Errors changing between mixed and improper fractions',

  // Decimals
  'Decimals_IncorrectPlaceValueShift': 'Moving decimal point wrong number of places',
  'FractionDecimal_ConversionError': 'Trouble converting between fractions and decimals',

  // Percentages & Ratios
  'Percentage_IncorrectOperation': 'Using wrong methods for percentages',
  'PieChart_PercentageCalculation': 'Difficulty calculating pie chart percentages',
  'Ratio_IncorrectShareCalculation': 'Errors splitting amounts in ratios',

  // Equivalence & Comparison
  'Equivalence_PartialRecognition': 'Only partly recognizing equivalent values',
  'Equivalence_NotRecognized': 'Missing when things are equal',
  'Equivalence_ScalingError': 'Errors when scaling equivalent values',

  // Prime Numbers & Factors
  'PrimeNumbers_OddNumberConfusion': 'Thinking all odd numbers are prime',
  'HCF_PartialFactorization': 'Finding some factors but missing the highest',
  'Factors_NonFactorConfusion': 'Confusing factors with other numbers',

  // Geometry - Shapes
  '3D_CountOnlyTriangles': 'Only counting triangular faces on 3D shapes',
  '3D_IncludeEdges': 'Including edges when counting faces',
  'Circle_RadiusDiameterConfusion': 'Mixing up radius and diameter',
  'Triangle_AddDimensions': 'Adding triangle measurements instead of using formula',
  'Triangle_MultiplyDimensions': 'Multiplying triangle sides incorrectly',
  'Lines_TermConfusion': 'Confusing different types of lines',

  // Geometry - Angles
  'Angle_ConfuseTypes': 'Mixing up different angle types',
  'Angle_EstimateWrong': 'Poor angle size estimation',
  'Angles_CopyGiven': 'Just copying given angle measurements',
  'Angles_Use360': 'Always using 360° in angle calculations',

  // Geometry - Area & Perimeter
  'Area_AddDimensions': 'Adding measurements instead of multiplying for area',
  'Area_IncorrectUnits': 'Using wrong units for area',
  'Area_SubtractShapes': 'Subtracting areas incorrectly',
  'Area_SubtractWrong': 'Wrong subtraction in area problems',
  'Area_WrongCalculation': 'Incorrect area calculation method',
  'Area_AddShapes': 'Adding areas incorrectly',
  'Geometry_AreaTriangle_NoDivideBy2': 'Forgetting to divide by 2 for triangle area',
  'Geometry_AreaParallelogram_AddDimensions': 'Adding instead of multiplying for parallelogram area',
  'Perimeter_AreaConfusion': 'Mixing up perimeter and area formulas',

  // Volume & Measurement
  'Volume_AddInsteadOfMultiply': 'Adding measurements instead of multiplying for volume',

  // Coordinates & Position
  'Coordinates_OrderError': 'Writing coordinates in wrong order (y,x instead of x,y)',

  // Money & Value
  'Money_SubtractionError': 'Errors with money subtraction',
  'Value_CompareTotals': 'Comparing wrong values',
  'Value_IgnoreQuantity': 'Not considering how much when comparing value',
  'BestBuy_CompareTotal': 'Comparing total costs instead of unit prices',
  'BestBuy_IgnoreQuantity': 'Ignoring quantities when finding best value',

  // Statistics & Data
  'Statistics_SubtractionError': 'Subtraction errors in data problems',

  // Scale & Estimation
  'Scaling_AdditionError': 'Adding instead of multiplying for scale',
  'ScaleFactor_LinearVsArea': 'Confusing linear and area scale factors',
  'Estimation_NoRounding': 'Not using rounding for estimation',
  'Estimation_WrongRounding': 'Rounding incorrectly for estimation',

  // Time
  'Time_QuarterConfusion': 'Difficulty with quarter past/to times',

  // Negative Numbers
  'NegativeNumbers_IncorrectOperation': 'Errors with negative number calculations',
  'NegativeNumbers_IntervalAcrossZero': 'Difficulty counting across zero'
};

/**
 * Get friendly name for a misconception code
 * Handles both raw codes and JSON-formatted codes
 */
export function getFriendlyMisconceptionName(code: string): string {
  if (!code || code.trim() === '') {
    return 'Learning Area';
  }

  // Clean up the code - remove brackets, quotes, and extra whitespace
  const cleanCode = code
    .replace(/[[\]"]/g, '')
    .replace(/^\s+|\s+$/g, '')
    .trim();

  // Return friendly label or fallback to cleaned code
  return MISCONCEPTION_LABELS[cleanCode] || cleanCode;
}

/**
 * Get all available misconception codes
 */
export function getAllMisconceptionCodes(): string[] {
  return Object.keys(MISCONCEPTION_LABELS);
}

/**
 * Check if a misconception code has a friendly label
 */
export function hasFriendlyLabel(code: string): boolean {
  const cleanCode = code.replace(/[[\]"]/g, '').trim();
  return cleanCode in MISCONCEPTION_LABELS;
}