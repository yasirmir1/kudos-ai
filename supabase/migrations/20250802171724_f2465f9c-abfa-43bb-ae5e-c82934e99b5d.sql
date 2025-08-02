-- First migration: Add missing enum values for cognitive_level
ALTER TYPE cognitive_level ADD VALUE IF NOT EXISTS 'knowledge';
ALTER TYPE cognitive_level ADD VALUE IF NOT EXISTS 'comprehension';
ALTER TYPE cognitive_level ADD VALUE IF NOT EXISTS 'evaluation';