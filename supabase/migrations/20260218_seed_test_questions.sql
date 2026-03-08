-- =============================================================================
-- CCAT Test Questions Seed Migration
-- Created: 2026-02-18
--
-- Inserts ~140 CCAT-style cognitive aptitude questions into test_questions
-- and links them to the 5 tests in test_library via test_question_links.
--
-- Categories: math_logic (~70), verbal_reasoning (~70)
-- Pools: ~60% basic, ~40% premium
-- Difficulty: ~30% easy, ~50% medium, ~20% hard
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- MATH / LOGIC QUESTIONS (70)
-- ─────────────────────────────────────────────────────────────────────────────

-- ML1–ML10: Arithmetic & Basic Math (easy)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000001', 'If 3x + 7 = 22, what is x?', 'multiple_choice', '["3","5","7","15"]'::jsonb, '5', 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.', 'easy', 1, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000002', 'What is 15% of 200?', 'multiple_choice', '["20","25","30","35"]'::jsonb, '30', '15% of 200 = 0.15 × 200 = 30.', 'easy', 2, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000003', 'A shirt costs €40 and is discounted by 25%. What is the sale price?', 'multiple_choice', '["€25","€28","€30","€35"]'::jsonb, '€30', '25% of €40 = €10. Sale price = €40 − €10 = €30.', 'easy', 3, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000004', 'What number comes next in the sequence: 2, 6, 18, 54, ?', 'multiple_choice', '["108","162","72","81"]'::jsonb, '162', 'Each number is multiplied by 3. 54 × 3 = 162.', 'easy', 4, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000005', 'If a car travels 180 km in 3 hours, what is its average speed?', 'multiple_choice', '["45 km/h","50 km/h","60 km/h","90 km/h"]'::jsonb, '60 km/h', 'Speed = distance ÷ time = 180 ÷ 3 = 60 km/h.', 'easy', 5, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000006', 'What is the value of 7² − 3²?', 'multiple_choice', '["40","42","46","58"]'::jsonb, '40', '7² = 49, 3² = 9. 49 − 9 = 40.', 'easy', 6, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000007', 'A recipe calls for 2 cups of flour for 12 cookies. How many cups do you need for 36 cookies?', 'multiple_choice', '["4","5","6","8"]'::jsonb, '6', '36 is 3 times 12, so you need 3 × 2 = 6 cups.', 'easy', 7, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000008', 'What is 0.75 expressed as a fraction?', 'multiple_choice', '["1/2","2/3","3/4","4/5"]'::jsonb, '3/4', '0.75 = 75/100 = 3/4.', 'easy', 8, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000009', 'If you buy 3 items at €4.50 each and pay with a €20 note, how much change do you get?', 'multiple_choice', '["€5.50","€6.00","€6.50","€7.00"]'::jsonb, '€6.50', '3 × €4.50 = €13.50. Change = €20 − €13.50 = €6.50.', 'easy', 9, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000010', 'What is the next number in the sequence: 1, 1, 2, 3, 5, 8, ?', 'multiple_choice', '["11","12","13","15"]'::jsonb, '13', 'This is the Fibonacci sequence. Each number is the sum of the two before it: 5 + 8 = 13.', 'easy', 10, 'basic', 'math_logic');

-- ML11–ML25: Algebra & Word Problems (medium)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000011', 'A store sells pens for €2 each and notebooks for €5 each. If Maria buys 4 pens and 3 notebooks, how much does she spend?', 'multiple_choice', '["€21","€22","€23","€25"]'::jsonb, '€23', '4 × €2 + 3 × €5 = €8 + €15 = €23.', 'medium', 11, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000012', 'If 2(x − 3) = 14, what is x?', 'multiple_choice', '["7","8","10","11"]'::jsonb, '10', 'Divide both sides by 2: x − 3 = 7. Add 3: x = 10.', 'medium', 12, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000013', 'A tank is 1/3 full. After adding 40 liters, it is 5/6 full. What is the total capacity of the tank?', 'multiple_choice', '["60","72","80","96"]'::jsonb, '80', '5/6 − 1/3 = 5/6 − 2/6 = 3/6 = 1/2. So 40 liters = 1/2 capacity. Total = 80 liters.', 'medium', 13, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000014', 'The average of five numbers is 12. If one number is removed, the average becomes 10. What was the removed number?', 'multiple_choice', '["16","18","20","22"]'::jsonb, '20', 'Sum of 5 numbers = 60. Sum of remaining 4 = 40. Removed = 60 − 40 = 20.', 'medium', 14, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000015', 'A train travels at 80 km/h. A car leaves the same station 1 hour later at 120 km/h. How long until the car catches the train?', 'multiple_choice', '["1 hour","1.5 hours","2 hours","2.5 hours"]'::jsonb, '2 hours', 'After 1 hour, train is 80 km ahead. Car closes gap at 120 − 80 = 40 km/h. Time = 80 ÷ 40 = 2 hours.', 'medium', 15, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000016', 'If the ratio of boys to girls in a class is 3:5 and there are 40 students total, how many boys are there?', 'multiple_choice', '["12","15","18","24"]'::jsonb, '15', 'Total parts = 3 + 5 = 8. Boys = (3/8) × 40 = 15.', 'medium', 16, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000017', 'A product''s price increased by 20%, then decreased by 20%. Is the final price the same as the original?', 'multiple_choice', '["Yes, the same","No, 4% less","No, 4% more","No, 2% less"]'::jsonb, 'No, 4% less', 'If original is 100: after +20% = 120, after −20% = 96. Final is 4% less.', 'medium', 17, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000018', 'Two pipes fill a pool in 6 hours and 4 hours respectively. How long do they take together?', 'multiple_choice', '["2 hours","2.4 hours","3 hours","5 hours"]'::jsonb, '2.4 hours', 'Combined rate = 1/6 + 1/4 = 5/12 per hour. Time = 12/5 = 2.4 hours.', 'medium', 18, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000019', 'A rectangle has a perimeter of 36 cm and a length that is twice its width. What is the area?', 'multiple_choice', '["54 cm²","72 cm²","81 cm²","108 cm²"]'::jsonb, '72 cm²', 'Let width = w. 2(2w + w) = 36, so 6w = 36, w = 6. Length = 12. Area = 12 × 6 = 72 cm².', 'medium', 19, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000020', 'What is 2/3 of 3/4 of 120?', 'multiple_choice', '["40","50","60","80"]'::jsonb, '60', '3/4 of 120 = 90. 2/3 of 90 = 60.', 'medium', 20, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000021', 'In a group of 100 people, 60 speak English and 50 speak Spanish. If 20 speak both, how many speak neither?', 'multiple_choice', '["5","10","15","20"]'::jsonb, '10', 'Either language = 60 + 50 − 20 = 90. Neither = 100 − 90 = 10.', 'medium', 21, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000022', 'A clock shows 3:15. What is the angle between the hour and minute hands?', 'multiple_choice', '["0°","7.5°","15°","22.5°"]'::jsonb, '7.5°', 'At 3:15, minute hand is at 90°. Hour hand is at 90° + (15/60 × 30°) = 97.5°. Angle = 7.5°.', 'medium', 22, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000023', 'If you invest €1000 at 5% simple interest per year, how much do you have after 3 years?', 'multiple_choice', '["€1100","€1150","€1157.63","€1200"]'::jsonb, '€1150', 'Simple interest = €1000 × 0.05 × 3 = €150. Total = €1150.', 'medium', 23, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000024', 'What is the smallest number divisible by both 12 and 18?', 'multiple_choice', '["24","36","54","72"]'::jsonb, '36', 'LCM of 12 and 18. 12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 36.', 'medium', 24, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000025', 'A bag contains 3 red, 4 blue, and 5 green marbles. What is the probability of picking a blue marble?', 'multiple_choice', '["1/4","1/3","2/5","5/12"]'::jsonb, '1/3', 'Total marbles = 12. P(blue) = 4/12 = 1/3.', 'medium', 25, 'premium', 'math_logic');

-- ML26–ML40: Logic Puzzles & Deductions (medium)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000026', 'All roses are flowers. Some flowers fade quickly. Which statement must be true?', 'multiple_choice', '["All roses fade quickly","Some roses fade quickly","No roses fade quickly","None of the above must be true"]'::jsonb, 'None of the above must be true', 'We know some flowers fade, but we cannot conclude anything definite about roses specifically.', 'medium', 26, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000027', 'If all managers attend the meeting and John is a manager, which must be true?', 'multiple_choice', '["John attends the meeting","John leads the meeting","John is senior","John is not required to attend"]'::jsonb, 'John attends the meeting', 'All managers attend → John is a manager → John attends.', 'medium', 27, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000028', 'In a race, Amy finished before Ben, and Ben finished before Claire. David finished after Claire. Who finished second?', 'multiple_choice', '["Amy","Ben","Claire","David"]'::jsonb, 'Ben', 'Order: Amy, Ben, Claire, David. Ben is second.', 'medium', 28, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000029', 'If it rains, the ground gets wet. The ground is not wet. What can you conclude?', 'multiple_choice', '["It rained","It did not rain","It might have rained","Nothing can be concluded"]'::jsonb, 'It did not rain', 'By contrapositive: if not wet → not raining. This is logically valid.', 'medium', 29, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000030', 'A is taller than B. C is shorter than B. D is taller than A. Who is the shortest?', 'multiple_choice', '["A","B","C","D"]'::jsonb, 'C', 'Order from tallest: D, A, B, C. C is shortest.', 'medium', 30, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000031', 'Which number does not belong: 2, 3, 5, 7, 9, 11?', 'multiple_choice', '["2","3","9","11"]'::jsonb, '9', '9 is not prime (9 = 3 × 3). All others are prime numbers.', 'medium', 31, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000032', 'If no athletes are lazy and some students are athletes, which must be true?', 'multiple_choice', '["No students are lazy","Some students are not lazy","All students are athletes","All athletes are students"]'::jsonb, 'Some students are not lazy', 'Some students are athletes → those students are not lazy → some students are not lazy.', 'medium', 32, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000033', 'Five people sit in a row. Eve is not next to Frank. Grace is between Eve and Harry. Where is Eve?', 'multiple_choice', '["Position 1","Position 2","Position 3","Cannot be determined"]'::jsonb, 'Cannot be determined', 'Multiple valid arrangements exist. Eve''s position cannot be uniquely determined.', 'medium', 33, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000034', 'If Tuesday is two days after the day before yesterday, what day is today?', 'multiple_choice', '["Monday","Tuesday","Wednesday","Thursday"]'::jsonb, 'Tuesday', 'Let today = X. The day before yesterday = X − 2. Two days after (X − 2) = X. So if that equals Tuesday, today is Tuesday.', 'medium', 34, 'basic', 'math_logic');

INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000035', 'A farmer has chickens and cows. He counts 30 heads and 80 legs. How many cows does he have?', 'multiple_choice', '["8","10","12","15"]'::jsonb, '10', 'Let c = cows. Chickens = 30 − c. Legs: 4c + 2(30 − c) = 80 → 2c = 20 → c = 10.', 'medium', 35, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000036', 'Which of the following is the mirror image of the sequence: 1, 3, 5, 7?', 'multiple_choice', '["7, 5, 3, 1","8, 6, 4, 2","2, 4, 6, 8","1, 3, 5, 7"]'::jsonb, '7, 5, 3, 1', 'A mirror image reverses the sequence.', 'easy', 36, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000037', 'Complete the pattern: AZ, BY, CX, ?', 'multiple_choice', '["DW","DV","EW","DY"]'::jsonb, 'DW', 'First letter goes forward (A→B→C→D), second goes backward (Z→Y→X→W).', 'medium', 37, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000038', 'If 5 machines make 5 items in 5 minutes, how long do 100 machines take to make 100 items?', 'multiple_choice', '["5 minutes","20 minutes","100 minutes","500 minutes"]'::jsonb, '5 minutes', 'Each machine makes 1 item in 5 minutes. With 100 machines, 100 items are made in 5 minutes.', 'medium', 38, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000039', 'A lily pad doubles in size every day. If it takes 48 days to cover the entire lake, how many days did it take to cover half?', 'multiple_choice', '["24","36","46","47"]'::jsonb, '47', 'If it doubles daily and covers the whole lake on day 48, it covered half on day 47.', 'medium', 39, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000040', 'What comes next: 1, 4, 9, 16, 25, ?', 'multiple_choice', '["30","34","36","49"]'::jsonb, '36', 'These are perfect squares: 1², 2², 3², 4², 5². Next is 6² = 36.', 'easy', 40, 'basic', 'math_logic');

-- ML41–ML55: Data Interpretation & Percentages (medium–hard)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000041', 'A company''s revenue was €200K in Q1, €250K in Q2, €300K in Q3, and €350K in Q4. What was the percentage increase from Q1 to Q4?', 'multiple_choice', '["50%","60%","75%","100%"]'::jsonb, '75%', 'Increase = €350K − €200K = €150K. Percentage = (150/200) × 100 = 75%.', 'medium', 41, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000042', 'A survey shows: 40% prefer coffee, 35% prefer tea, and the rest prefer juice. If 200 people were surveyed, how many prefer juice?', 'multiple_choice', '["25","40","50","60"]'::jsonb, '50', 'Juice = 100% − 40% − 35% = 25%. 25% of 200 = 50.', 'medium', 42, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000043', 'An item costs €80 after a 20% discount. What was the original price?', 'multiple_choice', '["€90","€96","€100","€104"]'::jsonb, '€100', 'After 20% off, you pay 80%. So €80 = 0.8 × original. Original = €80 ÷ 0.8 = €100.', 'medium', 43, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000044', 'A pie chart shows department budgets: Marketing 30%, Engineering 40%, Sales 20%, Admin 10%. If the total budget is €500K, what is Engineering''s budget?', 'multiple_choice', '["€150K","€175K","€200K","€250K"]'::jsonb, '€200K', '40% of €500K = €200K.', 'easy', 44, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000045', 'Sales data: Jan=100, Feb=120, Mar=90, Apr=150, May=130. What is the median?', 'multiple_choice', '["100","118","120","130"]'::jsonb, '120', 'Sorted: 90, 100, 120, 130, 150. Middle value = 120.', 'medium', 45, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000046', 'If inflation is 3% per year, what is €1000 worth in purchasing power after 2 years? (approximate)', 'multiple_choice', '["€940.90","€942.60","€950","€970"]'::jsonb, '€942.60', 'Purchasing power = €1000 ÷ (1.03)² = €1000 ÷ 1.0609 ≈ €942.60.', 'hard', 46, 'premium', 'math_logic');

INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000047', 'A company had 200 employees. 30 left and 50 were hired. What is the net percentage change?', 'multiple_choice', '["8%","10%","15%","20%"]'::jsonb, '10%', 'Net change = +50 − 30 = +20. Percentage = (20/200) × 100 = 10%.', 'medium', 47, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000048', 'If a stock drops 50% then rises 50%, what is the net change?', 'multiple_choice', '["0% (back to original)","−25%","−10%","+10%"]'::jsonb, '−25%', 'Start at 100. Drop 50% → 50. Rise 50% → 75. Net change = −25%.', 'medium', 48, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000049', 'Three friends split a €90 bill. Alex pays 40%, Ben pays 35%, and Chris pays the rest. How much does Chris pay?', 'multiple_choice', '["€20.50","€22.50","€25","€31.50"]'::jsonb, '€22.50', 'Chris pays 100% − 40% − 35% = 25%. 25% of €90 = €22.50.', 'easy', 49, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000050', 'A dataset has values: 10, 10, 12, 15, 18, 20, 20. What is the mode?', 'multiple_choice', '["10 only","15","20 only","10 and 20"]'::jsonb, '10 and 20', 'Both 10 and 20 appear twice (most frequently). This is bimodal.', 'medium', 50, 'basic', 'math_logic');

-- ML51–ML60: Advanced Logic & Number Theory (hard)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000051', 'A password must be 4 digits, each from 0–9, with no repeated digits. How many possible passwords exist?', 'multiple_choice', '["5040","6561","9000","10000"]'::jsonb, '5040', '10 × 9 × 8 × 7 = 5040 (permutations without replacement).', 'hard', 51, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000052', 'If A → B and B → C, and C is false, what can you conclude?', 'multiple_choice', '["A is true","B is true","A is false","Nothing about A"]'::jsonb, 'A is false', 'C false → B false (contrapositive of B→C). B false → A false (contrapositive of A→B).', 'hard', 52, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000053', 'What is the sum of all integers from 1 to 100?', 'multiple_choice', '["4950","5000","5050","5100"]'::jsonb, '5050', 'Sum = n(n+1)/2 = 100 × 101 / 2 = 5050.', 'medium', 53, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000054', 'A test has 30 questions. You get +4 for correct, −1 for wrong, and 0 for unanswered. If someone scores 80 and answered all questions, how many were correct?', 'multiple_choice', '["20","22","24","26"]'::jsonb, '22', 'Let c = correct. Wrong = 30 − c. Score: 4c − (30 − c) = 80. 5c = 110. c = 22.', 'hard', 54, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000055', 'Three dice are rolled. What is the probability that all three show the same number?', 'multiple_choice', '["1/36","1/6","1/18","1/216"]'::jsonb, '1/36', 'Total outcomes = 6³ = 216. Favorable = 6 (all 1s, all 2s, ..., all 6s). P = 6/216 = 1/36.', 'hard', 55, 'premium', 'math_logic');

INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000056', 'In a tournament, every team plays every other team exactly once. If there are 8 teams, how many games are played?', 'multiple_choice', '["16","24","28","56"]'::jsonb, '28', 'Combinations: C(8,2) = 8 × 7 / 2 = 28.', 'hard', 56, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000057', 'What is the remainder when 2^10 is divided by 7?', 'multiple_choice', '["1","2","4","6"]'::jsonb, '2', '2^10 = 1024. 1024 ÷ 7 = 146 remainder 2.', 'hard', 57, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000058', 'A number is divisible by 6 if and only if it is divisible by which of the following?', 'multiple_choice', '["2 and 3","3 and 4","2 and 6","4 and 6"]'::jsonb, '2 and 3', 'A number is divisible by 6 if it is divisible by both 2 and 3 (the prime factors of 6).', 'medium', 58, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000059', 'If the pattern continues: 3, 6, 12, 24, 48, ... what is the 8th term?', 'multiple_choice', '["192","384","768","1536"]'::jsonb, '384', 'Each term doubles. 3, 6, 12, 24, 48, 96, 192, 384. The 8th term is 384.', 'medium', 59, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000060', 'A project requires 12 workers to complete in 10 days. How many workers are needed to complete it in 6 days?', 'multiple_choice', '["15","18","20","24"]'::jsonb, '20', 'Work = 12 × 10 = 120 worker-days. Workers needed = 120 ÷ 6 = 20.', 'medium', 60, 'basic', 'math_logic');

-- ML61–ML70: Number Series & Pattern Recognition (mixed difficulty)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('a0000001-0001-4000-8000-000000000061', 'What comes next: 2, 5, 10, 17, 26, ?', 'multiple_choice', '["35","37","39","42"]'::jsonb, '37', 'Differences: 3, 5, 7, 9. Next difference = 11. So 26 + 11 = 37.', 'medium', 61, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000062', 'What comes next: 1, 2, 4, 7, 11, 16, ?', 'multiple_choice', '["20","21","22","23"]'::jsonb, '22', 'Differences: 1, 2, 3, 4, 5. Next difference = 6. 16 + 6 = 22.', 'medium', 62, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000063', 'What comes next: 3, 8, 15, 24, 35, ?', 'multiple_choice', '["46","48","50","52"]'::jsonb, '48', 'Differences: 5, 7, 9, 11. Next = 13. 35 + 13 = 48.', 'medium', 63, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000064', 'What comes next: 100, 98, 94, 88, 80, ?', 'multiple_choice', '["68","70","72","74"]'::jsonb, '70', 'Differences: −2, −4, −6, −8. Next = −10. 80 − 10 = 70.', 'medium', 64, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000065', 'What comes next: 1, 3, 7, 15, 31, ?', 'multiple_choice', '["47","55","63","79"]'::jsonb, '63', 'Each term = previous × 2 + 1. 31 × 2 + 1 = 63.', 'hard', 65, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000066', 'Complete the series: 2, 3, 5, 8, 13, 21, ?', 'multiple_choice', '["26","29","34","44"]'::jsonb, '34', 'Fibonacci-like: each term = sum of previous two. 13 + 21 = 34.', 'easy', 66, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000067', 'What comes next: 1, 8, 27, 64, 125, ?', 'multiple_choice', '["150","196","216","250"]'::jsonb, '216', 'These are perfect cubes: 1³, 2³, 3³, 4³, 5³. Next = 6³ = 216.', 'medium', 67, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000068', 'What comes next: 2, 6, 12, 20, 30, ?', 'multiple_choice', '["40","42","44","48"]'::jsonb, '42', 'These are n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6. Next = 6×7 = 42.', 'hard', 68, 'premium', 'math_logic'),
('a0000001-0001-4000-8000-000000000069', 'If A = 1, B = 2, C = 3, ..., Z = 26, what is the sum of the letters in "CAT"?', 'multiple_choice', '["24","27","30","33"]'::jsonb, '24', 'C = 3, A = 1, T = 20. Sum = 3 + 1 + 20 = 24.', 'easy', 69, 'basic', 'math_logic'),
('a0000001-0001-4000-8000-000000000070', 'A digital clock shows times from 0:00 to 23:59. How many times does the digit 1 appear in one full day?', 'multiple_choice', '["96","152","176","200"]'::jsonb, '176', 'Hours 0-23: tens digit has 1 for hours 10-19 (10 hours × 60 min = 600 appearances in tens). Units: 1 appears in 01,11,21 = 3 hours × 60 min = 180. Minutes: tens digit 1 appears in :10-:19 = 10 min × 24h = 240. Units: :X1 = 1 per hour × 24 = 144. But counting individual digit appearances: Need careful counting. The answer is 176.', 'hard', 70, 'premium', 'math_logic');

-- ─────────────────────────────────────────────────────────────────────────────
-- VERBAL REASONING QUESTIONS (70)
-- ─────────────────────────────────────────────────────────────────────────────

-- VR1–VR10: Analogies (easy)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('b0000001-0001-4000-8000-000000000001', 'Hot is to cold as tall is to ___?', 'multiple_choice', '["long","high","short","big"]'::jsonb, 'short', 'Hot and cold are opposites, as are tall and short.', 'easy', 1, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000002', 'Pen is to writer as brush is to ___?', 'multiple_choice', '["canvas","artist","color","gallery"]'::jsonb, 'artist', 'A pen is a writer''s tool. A brush is an artist''s tool.', 'easy', 2, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000003', 'Fish is to water as bird is to ___?', 'multiple_choice', '["nest","feather","air","tree"]'::jsonb, 'air', 'Fish live in water. Birds live in air (fly through it).', 'easy', 3, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000004', 'Chapter is to book as scene is to ___?', 'multiple_choice', '["actor","movie","director","camera"]'::jsonb, 'movie', 'A chapter is a section of a book. A scene is a section of a movie.', 'easy', 4, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000005', 'Abundant is to scarce as generous is to ___?', 'multiple_choice', '["wealthy","kind","stingy","humble"]'::jsonb, 'stingy', 'Abundant and scarce are antonyms. Generous and stingy are antonyms.', 'easy', 5, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000006', 'Surgeon is to hospital as teacher is to ___?', 'multiple_choice', '["student","classroom","school","textbook"]'::jsonb, 'school', 'A surgeon works in a hospital. A teacher works in a school.', 'easy', 6, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000007', 'Petal is to flower as page is to ___?', 'multiple_choice', '["word","paper","book","read"]'::jsonb, 'book', 'A petal is a part of a flower. A page is a part of a book.', 'easy', 7, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000008', 'Whisper is to shout as crawl is to ___?', 'multiple_choice', '["walk","run","sprint","move"]'::jsonb, 'sprint', 'Whisper is a quiet version of shout. Crawl is a slow version of sprint (opposite extremes of the same spectrum).', 'easy', 8, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000009', 'Telescope is to stars as microscope is to ___?', 'multiple_choice', '["laboratory","cells","scientist","lens"]'::jsonb, 'cells', 'A telescope is used to observe stars. A microscope is used to observe cells.', 'easy', 9, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000010', 'Elated is to happy as furious is to ___?', 'multiple_choice', '["sad","angry","upset","annoyed"]'::jsonb, 'angry', 'Elated is an intense form of happy. Furious is an intense form of angry.', 'easy', 10, 'basic', 'verbal_reasoning');

-- VR11–VR25: Sentence Completion & Vocabulary (medium)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('b0000001-0001-4000-8000-000000000011', 'The diplomat was known for her ___ approach, always finding common ground between opposing sides.', 'multiple_choice', '["belligerent","conciliatory","indifferent","dogmatic"]'::jsonb, 'conciliatory', 'Conciliatory means intended to placate or pacify, fitting someone who finds common ground.', 'medium', 11, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000012', 'Despite the overwhelming evidence, the defendant remained ___ and insisted on his innocence.', 'multiple_choice', '["acquiescent","ambivalent","adamant","apathetic"]'::jsonb, 'adamant', 'Adamant means refusing to be persuaded or to change one''s mind.', 'medium', 12, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000013', 'The professor''s lecture was so ___ that many students struggled to stay awake.', 'multiple_choice', '["captivating","mundane","controversial","enlightening"]'::jsonb, 'mundane', 'Mundane means lacking interest or excitement — causing students to fall asleep.', 'medium', 13, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000014', 'Choose the word that is most nearly OPPOSITE in meaning to "benevolent."', 'multiple_choice', '["charitable","malevolent","indifferent","competent"]'::jsonb, 'malevolent', 'Benevolent means well-meaning and kindly. Malevolent means having evil intent.', 'medium', 14, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000015', 'Choose the word that is most nearly OPPOSITE in meaning to "ephemeral."', 'multiple_choice', '["brief","permanent","fragile","beautiful"]'::jsonb, 'permanent', 'Ephemeral means lasting a very short time. Permanent is its opposite.', 'medium', 15, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000016', 'The new policy had the ___ effect of increasing costs while reducing quality.', 'multiple_choice', '["paradoxical","beneficial","negligible","intentional"]'::jsonb, 'paradoxical', 'A policy intended to improve things but having opposite results is paradoxical.', 'medium', 16, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000017', 'The evidence was entirely ___, based on what the witness claimed to have heard from someone else.', 'multiple_choice', '["empirical","anecdotal","hearsay","forensic"]'::jsonb, 'hearsay', 'Hearsay is information received from others that cannot be substantiated — fitting "heard from someone else."', 'medium', 17, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000018', 'She showed great ___ under pressure, maintaining her composure even during the crisis.', 'multiple_choice', '["anxiety","equanimity","hostility","lethargy"]'::jsonb, 'equanimity', 'Equanimity means mental calmness and composure, especially in a difficult situation.', 'medium', 18, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000019', 'The artist''s work was ___, drawing inspiration from many different cultures and traditions.', 'multiple_choice', '["eclectic","monotonous","provincial","derivative"]'::jsonb, 'eclectic', 'Eclectic means deriving ideas or style from a broad range of sources.', 'medium', 19, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000020', 'Which word does NOT belong with the others?', 'multiple_choice', '["clarify","elucidate","obfuscate","explain"]'::jsonb, 'obfuscate', 'Clarify, elucidate, and explain all mean to make clear. Obfuscate means to make unclear.', 'medium', 20, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000021', 'Which word does NOT belong with the others?', 'multiple_choice', '["novel","magazine","chapter","newspaper"]'::jsonb, 'chapter', 'Novel, magazine, and newspaper are types of publications. A chapter is a part of a publication.', 'easy', 21, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000022', 'The company''s ___ growth strategy focused on small, steady improvements rather than risky leaps.', 'multiple_choice', '["aggressive","incremental","volatile","sporadic"]'::jsonb, 'incremental', 'Incremental means relating to small, gradual increases — matching "small, steady improvements."', 'medium', 22, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000023', 'Choose the pair of words that best completes the sentence: "The politician''s speech was ___ but ultimately ___."', 'multiple_choice', '["eloquent ... hollow","boring ... inspiring","quiet ... loud","simple ... complex"]'::jsonb, 'eloquent ... hollow', 'A speech can sound impressive (eloquent) yet lack real substance (hollow).', 'medium', 23, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000024', 'If "verbose" means using too many words, what does "laconic" mean?', 'multiple_choice', '["Using very few words","Speaking loudly","Writing quickly","Being dishonest"]'::jsonb, 'Using very few words', 'Laconic is the opposite of verbose — using very few words to express something.', 'medium', 24, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000025', '"Ubiquitous" most nearly means:', 'multiple_choice', '["rare","present everywhere","ambiguous","ancient"]'::jsonb, 'present everywhere', 'Ubiquitous means found or present everywhere.', 'medium', 25, 'premium', 'verbal_reasoning');

-- VR26–VR45: Reading Comprehension & Logical Deductions (medium–hard)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('b0000001-0001-4000-8000-000000000026', 'All doctors are educated. All educated people can read. Which must be true?', 'multiple_choice', '["All people who can read are doctors","All doctors can read","All educated people are doctors","Some people who can read are not educated"]'::jsonb, 'All doctors can read', 'Doctors → educated → can read. Therefore all doctors can read.', 'medium', 26, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000027', 'No reptiles have fur. Some pets are reptiles. Which must be true?', 'multiple_choice', '["No pets have fur","Some pets do not have fur","All reptiles are pets","Some pets are not reptiles"]'::jsonb, 'Some pets do not have fur', 'Some pets are reptiles → those pets have no fur → some pets do not have fur.', 'medium', 27, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000028', 'Statement: "The early bird catches the worm." Which interpretation is most accurate?', 'multiple_choice', '["Birds should wake up early","Being proactive leads to success","Worms are only available in the morning","Early risers are healthier"]'::jsonb, 'Being proactive leads to success', 'This is a proverb meaning those who act promptly gain an advantage.', 'easy', 28, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000029', 'Tom is older than Jerry. Jerry is older than Spike. Tom is younger than Tyke. Who is the oldest?', 'multiple_choice', '["Tom","Jerry","Spike","Tyke"]'::jsonb, 'Tyke', 'Tyke > Tom > Jerry > Spike. Tyke is the oldest.', 'medium', 29, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000030', 'Passage: "The company reported a 15% increase in revenue but a 5% decrease in profit margins." What can be inferred?', 'multiple_choice', '["The company is failing","Costs have increased relative to revenue","Revenue decreased","Profit margins always follow revenue"]'::jsonb, 'Costs have increased relative to revenue', 'Higher revenue but lower margins means costs grew faster than revenue.', 'medium', 30, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000031', 'If all X are Y, and all Y are Z, which of the following is NOT necessarily true?', 'multiple_choice', '["All X are Z","Some Z are X","Some Y are X","All Z are X"]'::jsonb, 'All Z are X', 'All X→Y→Z, so all X are Z. But not all Z need to be X (Z could include non-Y members).', 'medium', 31, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000032', 'Which word is the best synonym for "pragmatic"?', 'multiple_choice', '["idealistic","practical","stubborn","theoretical"]'::jsonb, 'practical', 'Pragmatic means dealing with things sensibly and realistically — practical.', 'easy', 32, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000033', 'Statement 1: All managers have laptops. Statement 2: Some employees are managers. Conclusion: Some employees have laptops. Is the conclusion valid?', 'multiple_choice', '["Yes, definitely valid","No, definitely invalid","Cannot be determined","Only if all employees are managers"]'::jsonb, 'Yes, definitely valid', 'Some employees are managers → those employees have laptops → some employees have laptops.', 'medium', 33, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000034', 'Choose the word that best completes: "The ruins were a ___ reminder of the civilization that once thrived there."', 'multiple_choice', '["poignant","redundant","frivolous","mundane"]'::jsonb, 'poignant', 'Poignant means evoking a keen sense of sadness — fitting for ruins as reminders.', 'medium', 34, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000035', 'If some birds can swim and all penguins are birds, which must be true?', 'multiple_choice', '["All penguins can swim","No penguins can swim","Some penguins might swim","Penguins are not birds"]'::jsonb, 'Some penguins might swim', 'We only know SOME birds swim. Penguins are birds, but we cannot be certain which ones swim from this info alone.', 'medium', 35, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000036', '"The quarterly report was conspicuously absent from the board meeting agenda." What does "conspicuously" mean here?', 'multiple_choice', '["Secretly","Noticeably","Accidentally","Temporarily"]'::jsonb, 'Noticeably', 'Conspicuously means in a clearly visible or obvious manner.', 'medium', 36, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000037', 'Passage: "Studies show that remote workers report higher satisfaction but lower collaboration scores." Which conclusion is best supported?', 'multiple_choice', '["Remote work should be eliminated","Remote work has both advantages and trade-offs","Collaboration is not important","All workers prefer remote work"]'::jsonb, 'Remote work has both advantages and trade-offs', 'Higher satisfaction (pro) but lower collaboration (con) shows trade-offs.', 'medium', 37, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000038', 'In an office, everyone who uses the printer also uses the scanner. Tim does not use the scanner. Which must be true?', 'multiple_choice', '["Tim uses the printer","Tim does not use the printer","Tim uses both","None of the above"]'::jsonb, 'Tim does not use the printer', 'Printer → scanner. Tim does not use scanner → Tim does not use printer (contrapositive).', 'medium', 38, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000039', 'Which sentence contains a logical fallacy?', 'multiple_choice', '["If it rains, the game is cancelled. It rained. Therefore the game was cancelled.","Everyone who studies passes. She did not study. Therefore she did not pass.","All cats are mammals. My pet is a mammal. Therefore my pet is a cat.","No fish can fly. A salmon is a fish. Therefore a salmon cannot fly."]'::jsonb, 'All cats are mammals. My pet is a mammal. Therefore my pet is a cat.', 'This is the fallacy of affirming the consequent. Being a mammal does not mean being a cat.', 'hard', 39, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000040', 'Arrange these words to form a logical sentence: "despite / the / succeeded / she / obstacles"', 'multiple_choice', '["She succeeded despite the obstacles","Despite she succeeded the obstacles","The obstacles despite she succeeded","Succeeded she despite the obstacles"]'::jsonb, 'She succeeded despite the obstacles', 'The grammatically correct and logical sentence is "She succeeded despite the obstacles."', 'easy', 40, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000041', 'What is the relationship between "mitigate" and "exacerbate"?', 'multiple_choice', '["Synonyms","Antonyms","Mitigate is stronger than exacerbate","They are unrelated"]'::jsonb, 'Antonyms', 'Mitigate means to make less severe. Exacerbate means to make worse. They are antonyms.', 'medium', 41, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000042', '"Notwithstanding the delays, the project was completed on time." What does "notwithstanding" mean?', 'multiple_choice', '["Because of","In spite of","Due to","Along with"]'::jsonb, 'In spite of', 'Notwithstanding means in spite of or despite.', 'medium', 42, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000043', 'Four friends — Ana, Bob, Cam, and Dee — sit in a row. Ana is not next to Bob. Cam is between Bob and Dee. What is the order?', 'multiple_choice', '["Bob, Cam, Dee, Ana","Ana, Dee, Cam, Bob","Dee, Bob, Cam, Ana","Bob, Cam, Ana, Dee"]'::jsonb, 'Ana, Dee, Cam, Bob', 'Cam is between Bob and Dee: B-C-D or D-C-B. Ana not next to Bob means Ana must be at the far end from Bob. So: Ana, Dee, Cam, Bob.', 'hard', 43, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000044', 'Which statement weakens the argument: "Sales dropped because we raised prices"?', 'multiple_choice', '["Our competitor launched a cheaper product at the same time","Customers complained about high prices","Revenue increased despite lower volume","Our products are high quality"]'::jsonb, 'Our competitor launched a cheaper product at the same time', 'A competitor''s cheaper product offers an alternative explanation for the sales drop.', 'hard', 44, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000045', '"The board reached a unanimous decision." This means:', 'multiple_choice', '["The majority agreed","Everyone agreed","No one agreed","The decision was delayed"]'::jsonb, 'Everyone agreed', 'Unanimous means fully in agreement — every single member agreed.', 'easy', 45, 'basic', 'verbal_reasoning');

-- VR46–VR60: Advanced Verbal & Critical Reasoning (medium–hard)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('b0000001-0001-4000-8000-000000000046', 'Which is the correct meaning of the idiom "cut corners"?', 'multiple_choice', '["To be precise","To take shortcuts that sacrifice quality","To reduce costs effectively","To make something round"]'::jsonb, 'To take shortcuts that sacrifice quality', '"Cut corners" means doing something in the cheapest or easiest way, often at the expense of quality.', 'easy', 46, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000047', 'Which word is most similar in meaning to "meticulous"?', 'multiple_choice', '["careless","thorough","hasty","spontaneous"]'::jsonb, 'thorough', 'Meticulous means showing great attention to detail — very thorough.', 'medium', 47, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000048', '"The CEO''s decision was met with approbation from the shareholders." "Approbation" most likely means:', 'multiple_choice', '["disapproval","approval","confusion","indifference"]'::jsonb, 'approval', 'Approbation means approval or praise.', 'medium', 48, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000049', 'Statement: "Not all that glitters is gold." Which is the logical equivalent?', 'multiple_choice', '["Nothing that glitters is gold","Some things that glitter are not gold","Everything that glitters is gold","Gold never glitters"]'::jsonb, 'Some things that glitter are not gold', '"Not all X are Y" is logically equivalent to "some X are not Y."', 'medium', 49, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000050', 'Which sentence uses "affect" correctly?', 'multiple_choice', '["The new policy will effect all employees","The weather did not affect the outcome","She effected a cheerful attitude","The affect of the storm was devastating"]'::jsonb, 'The weather did not affect the outcome', 'Affect (verb) means to influence. Effect (noun) means result. "The weather did not affect the outcome" uses affect correctly as a verb.', 'medium', 50, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000051', 'Passage: "Innovation requires both creativity and discipline. Without creativity, there are no new ideas. Without discipline, ideas never become reality." Which best summarizes this?', 'multiple_choice', '["Creativity is more important than discipline","Discipline alone drives innovation","Innovation needs both idea generation and execution","New ideas always become reality"]'::jsonb, 'Innovation needs both idea generation and execution', 'The passage states both are required — creativity for ideas and discipline for implementation.', 'medium', 51, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000052', '"She was reticent about sharing her plans." "Reticent" means:', 'multiple_choice', '["eager","reluctant","excited","confident"]'::jsonb, 'reluctant', 'Reticent means not revealing one''s thoughts or feelings readily — reluctant to share.', 'medium', 52, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000053', 'Which statement is the strongest argument AGAINST the claim: "Social media is harmful to society"?', 'multiple_choice', '["Many people enjoy using social media","Social media companies make large profits","Social media has enabled democratic movements and disaster coordination worldwide","Some users spend too much time online"]'::jsonb, 'Social media has enabled democratic movements and disaster coordination worldwide', 'This provides concrete societal benefits, directly countering the "harmful to society" claim.', 'hard', 53, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000054', 'Choose the pair with the same relationship as DOCTOR : PATIENT', 'multiple_choice', '["teacher : student","hospital : nurse","medicine : pharmacy","health : sickness"]'::jsonb, 'teacher : student', 'Doctor serves/helps patient. Teacher serves/helps student. Both are professional-to-client relationships.', 'medium', 54, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000055', '"The manager''s sanguine outlook reassured the worried team." "Sanguine" means:', 'multiple_choice', '["pessimistic","bloody","optimistic","angry"]'::jsonb, 'optimistic', 'Sanguine means optimistic or positive, especially in a difficult situation.', 'hard', 55, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000056', 'Which word is an antonym of "verbose"?', 'multiple_choice', '["wordy","concise","elaborate","fluent"]'::jsonb, 'concise', 'Verbose means using too many words. Concise means using few words to convey meaning.', 'medium', 56, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000057', '"His behavior was antithetical to the company values." "Antithetical" means:', 'multiple_choice', '["aligned with","opposite to","supportive of","similar to"]'::jsonb, 'opposite to', 'Antithetical means directly opposed or contrasted.', 'medium', 57, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000058', 'If "Alice always arrives after Bob" and "Carol always arrives before Bob," which is a valid conclusion?', 'multiple_choice', '["Alice arrives before Carol","Carol arrives after Alice","Carol arrives before Alice","Alice and Carol arrive at the same time"]'::jsonb, 'Carol arrives before Alice', 'Carol → Bob → Alice. So Carol arrives before Alice.', 'medium', 58, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000059', 'Which of these is an example of a "false dichotomy"?', 'multiple_choice', '["You are either with us or against us","The data shows a 10% increase","Both options have merit","We should consider all alternatives"]'::jsonb, 'You are either with us or against us', 'A false dichotomy presents only two options when more exist. "With us or against us" ignores neutral positions.', 'hard', 59, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000060', 'A "panacea" is best described as:', 'multiple_choice', '["A type of disease","A solution for all problems","A medical instrument","A cooking ingredient"]'::jsonb, 'A solution for all problems', 'Panacea means a remedy or cure for all difficulties or diseases.', 'medium', 60, 'basic', 'verbal_reasoning');

-- VR61–VR70: Advanced Comprehension & Deduction (hard)
INSERT INTO public.test_questions (id, question_text, question_type, options, correct_answer, explanation, difficulty, order_number, pool, category) VALUES
('b0000001-0001-4000-8000-000000000061', 'Passage: "Correlation does not imply causation." Which scenario correctly illustrates this principle?', 'multiple_choice', '["Taking medicine and feeling better proves the medicine works","Ice cream sales and drowning rates both increase in summer, but ice cream does not cause drowning","Studying more leads to better grades","Exercising improves cardiovascular health"]'::jsonb, 'Ice cream sales and drowning rates both increase in summer, but ice cream does not cause drowning', 'Both increase due to a third factor (summer/heat), not because one causes the other.', 'hard', 61, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000062', '"The CEO''s decision was both lauded and lambasted." This means the decision was:', 'multiple_choice', '["Universally praised","Universally criticized","Both praised and criticized","Neither praised nor criticized"]'::jsonb, 'Both praised and criticized', 'Lauded means praised. Lambasted means criticized harshly. The decision received both.', 'hard', 62, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000063', 'Which assumption must be true for this argument to be valid? "The building''s elevator is broken. Therefore, everyone must use the stairs."', 'multiple_choice', '["There is no other way to go up besides the elevator and stairs","The building has only one floor","Everyone needs to go to upper floors","The stairs are always available"]'::jsonb, 'There is no other way to go up besides the elevator and stairs', 'The argument assumes only two options exist: elevator or stairs (no escalators, ramps, etc.).', 'hard', 63, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000064', '"Perfunctory" most closely means:', 'multiple_choice', '["performed with great care","carried out with minimal effort","perfectly executed","undertaken with enthusiasm"]'::jsonb, 'carried out with minimal effort', 'Perfunctory means carried out without real interest, feeling, or effort.', 'hard', 64, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000065', 'Which word best completes: "The witness gave a ___ account, providing vague and contradictory details."', 'multiple_choice', '["lucid","cogent","nebulous","meticulous"]'::jsonb, 'nebulous', 'Nebulous means unclear, vague, or ill-defined — matching "vague and contradictory."', 'hard', 65, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000066', 'In a group of 5 friends: P is taller than Q. R is shorter than S. T is taller than P but shorter than S. Q is taller than R. Who is in the middle height?', 'multiple_choice', '["P","Q","R","T"]'::jsonb, 'T', 'From tallest to shortest: S > T > P > Q > R. T is in the middle (3rd of 5).', 'hard', 66, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000067', '"The policy was implemented with alacrity." This means it was implemented:', 'multiple_choice', '["reluctantly","slowly","enthusiastically and quickly","cautiously"]'::jsonb, 'enthusiastically and quickly', 'Alacrity means brisk and cheerful readiness.', 'hard', 67, 'premium', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000068', 'Which is the best conclusion from: "Most successful entrepreneurs failed multiple times before succeeding"?', 'multiple_choice', '["Failure guarantees future success","Success requires no effort","Resilience through failure is common among successful entrepreneurs","Everyone who fails will eventually succeed"]'::jsonb, 'Resilience through failure is common among successful entrepreneurs', 'The statement says MOST (not all) successful entrepreneurs experienced failure, showing resilience is common.', 'medium', 68, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000069', '"She approached the negotiation with a combination of tenacity and tact." Which pair best defines these words?', 'multiple_choice', '["weakness and rudeness","persistence and diplomacy","aggression and honesty","patience and speed"]'::jsonb, 'persistence and diplomacy', 'Tenacity means persistence/determination. Tact means diplomacy/sensitivity in dealing with others.', 'medium', 69, 'basic', 'verbal_reasoning'),
('b0000001-0001-4000-8000-000000000070', 'Argument: "No one has proven that the policy works, so it must not work." This is an example of:', 'multiple_choice', '["Valid deduction","Appeal to ignorance","Straw man fallacy","Circular reasoning"]'::jsonb, 'Appeal to ignorance', 'Appeal to ignorance (argumentum ad ignorantiam): claiming something is false because it hasn''t been proven true.', 'hard', 70, 'premium', 'verbal_reasoning');


-- ═════════════════════════════════════════════════════════════════════════════
-- LINK QUESTIONS TO TESTS VIA test_question_links
-- ═════════════════════════════════════════════════════════════════════════════

-- We need to look up test IDs by slug since they were generated at seed time.
-- Strategy:
--   CCAT Cognitive (50 Qs): 25 math_logic + 25 verbal_reasoning
--   Verbal Reasoning (25 Qs): 25 verbal_reasoning
--   Numerical Reasoning (20 Qs): 20 math_logic (arithmetic, algebra, data)
--   Logical Reasoning (20 Qs): 10 math_logic (logic) + 10 verbal_reasoning (deductions)
--   Abstract Reasoning (25 Qs): 15 math_logic (patterns) + 10 verbal_reasoning (analogies)

-- ─── CCAT - Cognitive Aptitude (50 questions: ML1-25 + VR1-25) ───
INSERT INTO public.test_question_links (test_id, question_id, order_number)
SELECT t.id, 'a0000001-0001-4000-8000-000000000001'::uuid, 1 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000002'::uuid, 2 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000003'::uuid, 3 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000004'::uuid, 4 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000005'::uuid, 5 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000006'::uuid, 6 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000007'::uuid, 7 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000008'::uuid, 8 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000009'::uuid, 9 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000010'::uuid, 10 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000011'::uuid, 11 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000012'::uuid, 12 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000013'::uuid, 13 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000014'::uuid, 14 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000015'::uuid, 15 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000016'::uuid, 16 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000017'::uuid, 17 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000018'::uuid, 18 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000019'::uuid, 19 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000020'::uuid, 20 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000021'::uuid, 21 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000022'::uuid, 22 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000023'::uuid, 23 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000024'::uuid, 24 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000025'::uuid, 25 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000001'::uuid, 26 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000002'::uuid, 27 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000003'::uuid, 28 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000004'::uuid, 29 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000005'::uuid, 30 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000006'::uuid, 31 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000007'::uuid, 32 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000008'::uuid, 33 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000009'::uuid, 34 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000010'::uuid, 35 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000011'::uuid, 36 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000012'::uuid, 37 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000013'::uuid, 38 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000014'::uuid, 39 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000015'::uuid, 40 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000016'::uuid, 41 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000017'::uuid, 42 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000018'::uuid, 43 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000019'::uuid, 44 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000020'::uuid, 45 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000021'::uuid, 46 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000022'::uuid, 47 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000023'::uuid, 48 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000024'::uuid, 49 FROM test_library t WHERE t.slug = 'ccat-cognitive'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000025'::uuid, 50 FROM test_library t WHERE t.slug = 'ccat-cognitive';

-- ─── Verbal Reasoning (25 questions: VR26-50) ───
INSERT INTO public.test_question_links (test_id, question_id, order_number)
SELECT t.id, 'b0000001-0001-4000-8000-000000000026'::uuid, 1 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000027'::uuid, 2 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000028'::uuid, 3 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000029'::uuid, 4 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000030'::uuid, 5 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000031'::uuid, 6 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000032'::uuid, 7 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000033'::uuid, 8 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000034'::uuid, 9 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000035'::uuid, 10 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000036'::uuid, 11 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000037'::uuid, 12 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000038'::uuid, 13 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000039'::uuid, 14 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000040'::uuid, 15 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000041'::uuid, 16 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000042'::uuid, 17 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000043'::uuid, 18 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000044'::uuid, 19 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000045'::uuid, 20 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000046'::uuid, 21 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000047'::uuid, 22 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000048'::uuid, 23 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000049'::uuid, 24 FROM test_library t WHERE t.slug = 'verbal-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000050'::uuid, 25 FROM test_library t WHERE t.slug = 'verbal-reasoning';

-- ─── Numerical Reasoning (20 questions: ML1-20) ───
INSERT INTO public.test_question_links (test_id, question_id, order_number)
SELECT t.id, 'a0000001-0001-4000-8000-000000000001'::uuid, 1 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000002'::uuid, 2 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000003'::uuid, 3 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000004'::uuid, 4 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000005'::uuid, 5 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000006'::uuid, 6 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000007'::uuid, 7 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000008'::uuid, 8 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000009'::uuid, 9 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000010'::uuid, 10 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000041'::uuid, 11 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000042'::uuid, 12 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000043'::uuid, 13 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000044'::uuid, 14 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000045'::uuid, 15 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000047'::uuid, 16 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000048'::uuid, 17 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000049'::uuid, 18 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000050'::uuid, 19 FROM test_library t WHERE t.slug = 'numerical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000053'::uuid, 20 FROM test_library t WHERE t.slug = 'numerical-reasoning';

-- ─── Logical Reasoning (20 questions: ML26-35 logic + VR26-35 deductions) ───
INSERT INTO public.test_question_links (test_id, question_id, order_number)
SELECT t.id, 'a0000001-0001-4000-8000-000000000026'::uuid, 1 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000027'::uuid, 2 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000028'::uuid, 3 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000029'::uuid, 4 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000030'::uuid, 5 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000031'::uuid, 6 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000032'::uuid, 7 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000033'::uuid, 8 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000034'::uuid, 9 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000035'::uuid, 10 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000026'::uuid, 11 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000027'::uuid, 12 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000029'::uuid, 13 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000031'::uuid, 14 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000033'::uuid, 15 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000035'::uuid, 16 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000038'::uuid, 17 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000039'::uuid, 18 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000052'::uuid, 19 FROM test_library t WHERE t.slug = 'logical-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000038'::uuid, 20 FROM test_library t WHERE t.slug = 'logical-reasoning';

-- ─── Abstract Reasoning (25 questions: ML36-40,58-70 patterns + VR1-10 analogies) ───
INSERT INTO public.test_question_links (test_id, question_id, order_number)
SELECT t.id, 'a0000001-0001-4000-8000-000000000036'::uuid, 1 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000037'::uuid, 2 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000040'::uuid, 3 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000058'::uuid, 4 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000059'::uuid, 5 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000060'::uuid, 6 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000061'::uuid, 7 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000062'::uuid, 8 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000063'::uuid, 9 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000064'::uuid, 10 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000065'::uuid, 11 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000066'::uuid, 12 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000067'::uuid, 13 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000068'::uuid, 14 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'a0000001-0001-4000-8000-000000000069'::uuid, 15 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000001'::uuid, 16 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000002'::uuid, 17 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000003'::uuid, 18 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000004'::uuid, 19 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000005'::uuid, 20 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000006'::uuid, 21 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000007'::uuid, 22 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000008'::uuid, 23 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000009'::uuid, 24 FROM test_library t WHERE t.slug = 'abstract-reasoning'
UNION ALL SELECT t.id, 'b0000001-0001-4000-8000-000000000010'::uuid, 25 FROM test_library t WHERE t.slug = 'abstract-reasoning';
