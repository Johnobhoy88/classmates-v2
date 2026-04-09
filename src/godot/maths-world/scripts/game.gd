# Classmates — Maths Runner
# © 2026 John McMillan (HighlandAI). All rights reserved.

extends Node2D

## Auto-scrolling 2D maths runner. Player runs right automatically,
## jumps with tap/space, collects coins, smashes through answer gates.

const SCROLL_SPEED = 200.0
const GRAVITY = 800.0
const JUMP_FORCE = -380.0
const GROUND_Y = 400.0
const GATE_SPACING = 500.0

var velocity_y = 0.0
var player_y = GROUND_Y
var is_jumping = false
var scroll_x = 0.0

var score = 0
var total = 10
var current_q = 0
var correct_count = 0
var streak = 0
var best_streak = 0

var questions: Array = []
var gates: Array = [] # [{x, q_index, top_answer, bot_answer, top_correct, alive}]
var coins: Array = [] # [{x, y, collected}]
var particles: Array = [] # [{x, y, vx, vy, color, life}]

var game_over = false
var show_results = false
var feedback_timer = 0.0
var feedback_text = ""
var feedback_color = Color.WHITE

# Background layers
var cloud_offsets: Array = []
var hill_offsets: Array = []
var tree_positions: Array = []

func _ready() -> void:
	_generate_questions()
	_generate_level()
	_init_background()

func _init_background() -> void:
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	for i in range(8):
		cloud_offsets.append(Vector2(rng.randf_range(0, 1200), rng.randf_range(30, 120)))
	for i in range(6):
		hill_offsets.append(rng.randf_range(0, 1000))
	for i in range(30):
		tree_positions.append(Vector2(rng.randf_range(0, 5000), rng.randf_range(360, 395)))

func _generate_questions() -> void:
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	for i in range(total):
		var a = rng.randi_range(1, 12 + i * 2)
		var b = rng.randi_range(1, 12 + i * 2)
		var ops = ["+", "-", "×"]
		var op = ops[rng.randi_range(0, 2)]
		var answer = 0
		match op:
			"+":
				answer = a + b
			"-":
				if a < b:
					var tmp = a
					a = b
					b = tmp
				answer = a - b
			"×":
				a = rng.randi_range(2, 6 + i)
				b = rng.randi_range(2, 6 + i)
				answer = a * b
		var wrong = answer + rng.randi_range(1, 8) * (1 if rng.randf() > 0.5 else -1)
		if wrong == answer:
			wrong = answer + 3
		if wrong <= 0:
			wrong = answer + rng.randi_range(1, 5)
		var top_is_correct = rng.randf() > 0.5
		questions.append({
			"prompt": "%d %s %d" % [a, op, b],
			"answer": answer,
			"wrong": wrong,
			"top_correct": top_is_correct
		})

func _generate_level() -> void:
	for i in range(total):
		var gate_x = 600 + i * GATE_SPACING
		var q = questions[i]
		gates.append({
			"x": gate_x,
			"q_index": i,
			"top_answer": q["answer"] if q["top_correct"] else q["wrong"],
			"bot_answer": q["wrong"] if q["top_correct"] else q["answer"],
			"top_correct": q["top_correct"],
			"alive": true
		})
		# Coins between gates
		for c in range(3):
			coins.append({
				"x": gate_x - 250 + c * 80,
				"y": GROUND_Y - 60 - c * 30,
				"collected": false
			})

func _unhandled_input(event: InputEvent) -> void:
	if game_over:
		if show_results and event is InputEventMouseButton and event.pressed:
			_send_results()
		return
	if event is InputEventMouseButton and event.pressed:
		_do_jump()
	if event is InputEventScreenTouch and event.pressed:
		_do_jump()
	if event.is_action_pressed("jump"):
		_do_jump()

func _do_jump() -> void:
	if not is_jumping:
		velocity_y = JUMP_FORCE
		is_jumping = true

func _process(delta: float) -> void:
	if game_over:
		if not show_results:
			feedback_timer -= delta
			if feedback_timer <= 0:
				show_results = true
		queue_redraw()
		return

	# Scroll
	scroll_x += SCROLL_SPEED * delta

	# Gravity
	velocity_y += GRAVITY * delta
	player_y += velocity_y * delta
	if player_y >= GROUND_Y:
		player_y = GROUND_Y
		velocity_y = 0
		is_jumping = false

	# Check gate collisions
	var player_world_x = scroll_x + 150
	for gate in gates:
		if not gate["alive"]:
			continue
		if abs(player_world_x - gate["x"]) < 30:
			gate["alive"] = false
			var in_top = player_y < (GROUND_Y - 80)
			var is_correct = (in_top and gate["top_correct"]) or (not in_top and not gate["top_correct"])
			if is_correct:
				correct_count += 1
				streak += 1
				if streak > best_streak:
					best_streak = streak
				score += 10 + streak * 2
				feedback_text = "Correct!"
				feedback_color = Color(0.2, 1.0, 0.4)
				_spawn_particles(150, player_y, Color(0.2, 1.0, 0.4))
			else:
				streak = 0
				feedback_text = "Wrong!"
				feedback_color = Color(1.0, 0.3, 0.3)
				_spawn_particles(150, player_y, Color(1.0, 0.3, 0.3))
			feedback_timer = 0.8
			current_q += 1
			if current_q >= total:
				game_over = true
				feedback_timer = 1.5

	# Coin collection
	for coin in coins:
		if coin["collected"]:
			continue
		var cx = coin["x"] - scroll_x
		if abs(cx - 150) < 25 and abs(coin["y"] - player_y) < 35:
			coin["collected"] = true
			score += 5
			_spawn_particles(150, player_y, Color(1.0, 0.85, 0.1))

	# Feedback timer
	if feedback_timer > 0:
		feedback_timer -= delta

	# Update particles
	var dead_particles = []
	for i in range(particles.size()):
		var p = particles[i]
		p["x"] += p["vx"] * delta
		p["y"] += p["vy"] * delta
		p["vy"] += 200 * delta
		p["life"] -= delta
		if p["life"] <= 0:
			dead_particles.append(i)
	dead_particles.reverse()
	for i in dead_particles:
		particles.remove_at(i)

	queue_redraw()

func _spawn_particles(px: float, py: float, color: Color) -> void:
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	for i in range(15):
		particles.append({
			"x": px,
			"y": py,
			"vx": rng.randf_range(-200, 200),
			"vy": rng.randf_range(-300, -50),
			"color": color.lerp(Color.WHITE, rng.randf_range(0, 0.4)),
			"life": rng.randf_range(0.3, 0.8)
		})

func _draw() -> void:
	# Sky gradient
	for i in range(27):
		var t = float(i) / 27.0
		var sky_color = Color(0.35 + t * 0.2, 0.65 + t * 0.15, 0.95 - t * 0.05)
		draw_rect(Rect2(0, i * 20, 960, 20), sky_color)

	# Clouds (parallax)
	for c in cloud_offsets:
		var cx = fmod(c.x - scroll_x * 0.15 + 1200, 1400) - 200
		draw_circle(Vector2(cx, c.y), 35, Color(1, 1, 1, 0.7))
		draw_circle(Vector2(cx - 25, c.y + 8), 28, Color(1, 1, 1, 0.65))
		draw_circle(Vector2(cx + 30, c.y + 5), 30, Color(1, 1, 1, 0.68))

	# Distant hills (parallax)
	for i in range(6):
		var hx = fmod(hill_offsets[i] - scroll_x * 0.3 + 1200, 1600) - 400
		var h_color = Color(0.25, 0.55 + i * 0.03, 0.3, 0.5)
		var points = PackedVector2Array()
		for s in range(21):
			var sx = hx + s * 40
			var sy = 340 - sin(s * 0.5 + i) * (40 + i * 10)
			points.append(Vector2(sx, sy))
		points.append(Vector2(hx + 800, 540))
		points.append(Vector2(hx, 540))
		if points.size() >= 3:
			draw_colored_polygon(points, h_color)

	# Trees (parallax)
	for t in tree_positions:
		var tx = fmod(t.x - scroll_x * 0.6 + 2000, 3000) - 500
		# Trunk
		draw_rect(Rect2(tx - 4, t.y - 30, 8, 50), Color(0.45, 0.3, 0.15))
		# Canopy
		draw_circle(Vector2(tx, t.y - 40), 22, Color(0.2, 0.6, 0.25))
		draw_circle(Vector2(tx - 12, t.y - 30), 16, Color(0.25, 0.65, 0.3))
		draw_circle(Vector2(tx + 14, t.y - 32), 18, Color(0.22, 0.58, 0.27))

	# Ground
	draw_rect(Rect2(0, GROUND_Y + 20, 960, 120), Color(0.35, 0.65, 0.2))
	# Grass tufts
	for i in range(48):
		var gx = fmod(i * 20.0 - scroll_x * 1.0, 960)
		if gx < 0:
			gx += 960
		draw_line(Vector2(gx, GROUND_Y + 20), Vector2(gx - 4, GROUND_Y + 10), Color(0.3, 0.7, 0.15), 2.0)
		draw_line(Vector2(gx, GROUND_Y + 20), Vector2(gx + 3, GROUND_Y + 8), Color(0.35, 0.75, 0.2), 2.0)

	# Dirt stripe
	draw_rect(Rect2(0, GROUND_Y + 20, 960, 4), Color(0.5, 0.35, 0.15))

	# Gates
	for gate in gates:
		if not gate["alive"]:
			continue
		var gx = gate["x"] - scroll_x
		if gx < -100 or gx > 1100:
			continue
		# Top gate (jump to reach)
		var top_color = Color(0.2, 0.8, 0.4) if gate["top_correct"] else Color(0.9, 0.3, 0.3)
		var bot_color = Color(0.9, 0.3, 0.3) if gate["top_correct"] else Color(0.2, 0.8, 0.4)
		# But player doesn't know which is correct — show both as neutral with answer
		top_color = Color(0.3, 0.5, 0.9)
		bot_color = Color(0.9, 0.5, 0.2)

		# Top platform
		draw_rect(Rect2(gx - 40, GROUND_Y - 140, 80, 50), top_color)
		draw_string(ThemeDB.fallback_font, Vector2(gx - 15, GROUND_Y - 108), str(gate["top_answer"]), HORIZONTAL_ALIGNMENT_CENTER, -1, 22, Color.WHITE)

		# Bottom platform
		draw_rect(Rect2(gx - 40, GROUND_Y - 30, 80, 50), bot_color)
		draw_string(ThemeDB.fallback_font, Vector2(gx - 15, GROUND_Y + 2), str(gate["bot_answer"]), HORIZONTAL_ALIGNMENT_CENTER, -1, 22, Color.WHITE)

		# Question prompt above
		var q = questions[gate["q_index"]]
		draw_string(ThemeDB.fallback_font, Vector2(gx - 30, GROUND_Y - 160), q["prompt"], HORIZONTAL_ALIGNMENT_CENTER, -1, 18, Color(1, 1, 0.7))

	# Coins
	for coin in coins:
		if coin["collected"]:
			continue
		var cx = coin["x"] - scroll_x
		if cx < -50 or cx > 1010:
			continue
		draw_circle(Vector2(cx, coin["y"]), 12, Color(1.0, 0.85, 0.1))
		draw_circle(Vector2(cx, coin["y"]), 8, Color(1.0, 0.95, 0.5))

	# Particles
	for p in particles:
		var alpha = clampf(p["life"] * 2, 0, 1)
		var c = p["color"]
		c.a = alpha
		draw_circle(Vector2(p["x"], p["y"]), 4 + p["life"] * 6, c)

	# Player (Sonic-style circle character)
	var px = 150.0
	var py = player_y
	# Shadow
	# Shadow (oval using scaled circle)
	draw_set_transform(Vector2(px, GROUND_Y + 18), 0, Vector2(1.8, 0.5))
	draw_circle(Vector2.ZERO, 12, Color(0, 0, 0, 0.2))
	draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
	# Body
	draw_circle(Vector2(px, py - 8), 22, Color(0.2, 0.4, 1.0))
	# Belly
	draw_circle(Vector2(px + 2, py - 4), 14, Color(0.6, 0.8, 1.0))
	# Eye
	draw_circle(Vector2(px + 10, py - 16), 7, Color.WHITE)
	draw_circle(Vector2(px + 12, py - 16), 4, Color(0.1, 0.1, 0.2))
	# Feet
	if not is_jumping:
		var foot_offset = sin(scroll_x * 0.05) * 5
		draw_circle(Vector2(px - 8, py + 12 + foot_offset), 6, Color(0.8, 0.2, 0.2))
		draw_circle(Vector2(px + 8, py + 12 - foot_offset), 6, Color(0.8, 0.2, 0.2))
	else:
		# Tucked legs
		draw_circle(Vector2(px - 6, py + 6), 5, Color(0.8, 0.2, 0.2))
		draw_circle(Vector2(px + 6, py + 6), 5, Color(0.8, 0.2, 0.2))

	# HUD
	# Score
	draw_string(ThemeDB.fallback_font, Vector2(20, 35), "Score: %d" % score, HORIZONTAL_ALIGNMENT_LEFT, -1, 24, Color.WHITE)
	# Progress
	draw_string(ThemeDB.fallback_font, Vector2(800, 35), "%d / %d" % [current_q, total], HORIZONTAL_ALIGNMENT_LEFT, -1, 24, Color.WHITE)
	# Streak
	if streak >= 2:
		draw_string(ThemeDB.fallback_font, Vector2(400, 35), "%d streak 🔥" % streak, HORIZONTAL_ALIGNMENT_CENTER, -1, 20, Color(1, 0.8, 0.2))

	# Feedback text
	if feedback_timer > 0 and feedback_text != "":
		var alpha = clampf(feedback_timer * 3, 0, 1)
		var fc = feedback_color
		fc.a = alpha
		draw_string(ThemeDB.fallback_font, Vector2(350, 250), feedback_text, HORIZONTAL_ALIGNMENT_CENTER, -1, 36, fc)

	# Touch hint
	if current_q == 0 and scroll_x < 200:
		draw_string(ThemeDB.fallback_font, Vector2(250, 480), "Tap to jump! Hit the correct answer.", HORIZONTAL_ALIGNMENT_CENTER, -1, 18, Color(1, 1, 1, 0.7))

	# Results screen
	if show_results:
		draw_rect(Rect2(0, 0, 960, 540), Color(0, 0, 0, 0.7))
		var stars = _calc_stars()
		var star_text = ""
		for i in range(3):
			star_text += "★" if i < stars else "☆"
		draw_string(ThemeDB.fallback_font, Vector2(350, 180), "Maths Runner!", HORIZONTAL_ALIGNMENT_CENTER, -1, 36, Color.WHITE)
		draw_string(ThemeDB.fallback_font, Vector2(380, 240), star_text, HORIZONTAL_ALIGNMENT_CENTER, -1, 48, Color(1, 0.85, 0.2))
		draw_string(ThemeDB.fallback_font, Vector2(340, 300), "%d / %d correct" % [correct_count, total], HORIZONTAL_ALIGNMENT_CENTER, -1, 28, Color(0.6, 1, 0.7))
		draw_string(ThemeDB.fallback_font, Vector2(340, 340), "Best streak: %d" % best_streak, HORIZONTAL_ALIGNMENT_CENTER, -1, 22, Color(1, 0.8, 0.5))
		draw_string(ThemeDB.fallback_font, Vector2(340, 400), "Score: %d" % score, HORIZONTAL_ALIGNMENT_CENTER, -1, 28, Color.WHITE)
		draw_string(ThemeDB.fallback_font, Vector2(320, 470), "Tap to finish", HORIZONTAL_ALIGNMENT_CENTER, -1, 20, Color(1, 1, 1, 0.5))

func _calc_stars() -> int:
	var pct = float(correct_count) / float(total)
	if pct >= 0.9:
		return 3
	elif pct >= 0.6:
		return 2
	elif pct >= 0.3:
		return 1
	return 0

func _send_results() -> void:
	var stars = _calc_stars()
	var js_code = """
	if (window.parent && window.parent !== window) {
		window.parent.postMessage({
			type: 'godot-game-result',
			gameId: 'maths-world',
			score: %d,
			total: %d,
			stars: %d,
			streak: %d,
			bestStreak: %d,
			correct: %d
		}, '*');
	}
	""" % [score, total, stars, streak, best_streak, correct_count]
	JavaScriptBridge.eval(js_code)
