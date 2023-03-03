class NoPixel_Fleeca {

    range = (start, end, length = end - start + 1) => {
        return Array.from({ length }, (_, i) => start + i)
    }
    random = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    shapes = ['square', 'rectangle', 'circle', 'triangle'];
    colors = ['blue', 'green', 'red', 'orange', 'yellow', 'purple', 'black', 'white'];
    types = [
        { 'type': 'background_color', 'text': 'BACKGROUND COLOR' },
        { 'type': 'number_color', 'text': 'NUMBER COLOR' },
        // Shape
        { 'type': 'shape', 'text': 'SHAPE' },
        { 'type': 'shape_color', 'text': 'SHAPE COLOR' },
        // Upper text - Color
        { 'type': 'text_color', 'text': 'TEXT COLOR' },
        { 'type': 'text_color_bg_color', 'text': 'COLOR TEXT BACKGROUND COLOR' },
        // Bottom text - Shape
        { 'type': 'text_shape', 'text': 'SHAPE TEXT' },
        { 'type': 'text_shape_bg_color', 'text': 'SHAPE TEXT BACKGROUND COLOR' }
    ];

    create() {
        let real_numbers, impostor_numbers, minigame, group, background_colors, text_colors, types, quiz_numbers;

        real_numbers = this.range(1, 5);
        this.shuffle(real_numbers);

        impostor_numbers = this.range(1, 5);
        this.shuffle(impostor_numbers);

        minigame = {
            'real_numbers': real_numbers,
            'impostor_numbers': impostor_numbers,
            'groups': []
        };

        for (let i = 0; i < 5; i++) {
            group = [];

            background_colors = [...this.colors];
            this.shuffle(background_colors);

            text_colors = [...this.colors];
            this.shuffle(text_colors);

            group['real_number'] = real_numbers[i];
            group['impostor_number'] = impostor_numbers[i];

            group['background_color'] = background_colors[0];
            group['number_color'] = this.colors[this.random(0, this.colors.length)];

            group['shape'] = this.shapes[this.random(0, this.shapes.length)];
            group['shape_color'] = background_colors[1];


            group['text_color'] = this.colors[this.random(0, this.colors.length)];
            group['text_color_bg_color'] = text_colors[0];

            group['text_shape'] = this.shapes[this.random(0, this.shapes.length)];
            group['text_shape_bg_color'] = text_colors[1];

            minigame['groups'].push(group);
        }

        quiz_numbers = this.range(0, 4);
        this.shuffle(quiz_numbers);

        types = [...this.types];
        this.shuffle(types);

        let solution1 = minigame['groups'][quiz_numbers[0]][types[0]['type']];
        let solution2 = minigame['groups'][quiz_numbers[1]][types[1]['type']];
        solution1 = solution1.replace(/\d/, '');
        solution2 = solution2.replace(/\d/, '');

        minigame['quiz1'] = {
            'pos': quiz_numbers[0],
            'type': types[0],
            'solution': solution1
        };

        minigame['quiz2'] = {
            'pos': quiz_numbers[1],
            'type': types[1],
            'solution': solution2
        };

        minigame['solution'] = solution1 + ' ' + solution2;

        return minigame;
    }
}

let timer_start, timer_numbers, timer_game, timer_splash, data, speed;
let mode = 'vault';
let minigame = new NoPixel_Fleeca();
let streak = 0;
let max_streak = 0;
let game_started = false;

// Get max streak from cookie
const regex = /max-streak_vault=([\d]+)/g;
let cookie = document.cookie;
if ((cookie = regex.exec(cookie)) !== null) {
    max_streak = cookie[1];
}

let sleep = (ms, fn) => { return setTimeout(fn, ms) };

let audio_timer = document.querySelector('.timer audio');

// Resets
document.querySelector('.splash .btn_again').addEventListener('click', function(ev) {
    streak = 0;
    ev.target.innerHTML = 'AGAIN!';
    reset(true);
});
document.querySelector('.answer .btn_again').addEventListener('click', function() {
    streak = 0;
    reset();
});

// Process answer
document.querySelector('#answer').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && game_started === true) {
        game_started = false;

        clearTimeout(timer_game);
        audio_timer.pause();

        const answer = e.target.value.toLowerCase().trim();
        let wrapper = document.querySelector('.answer-wrapper');
        if (data.solution === answer) {
            wrapper.classList.remove('wrong');
            wrapper.classList.add('right');
            streak++;
            if (streak > max_streak) {
                max_streak = streak;
                document.cookie = "max-streak_vault=" + max_streak;
            }
            let leaderboard = new XMLHttpRequest();
            leaderboard.open("HEAD", 'streak.php?solution=' + answer.replace(' ', '_') +
                '&streak=' + streak + '&max_streak=' + max_streak + '&speed=' + (speed / 1000) + '&mode=' + mode);
            leaderboard.send();
            if ((mode === 'vault' && streak === 5)) {
                splash_screen();
                document.querySelector('.splash .message').innerText = "The system has been bypassed.";
            } else {
                reset();
            }

        } else {
            streak = 0;
            if (mode === 'practice') {
                wrapper.classList.remove('right');
                wrapper.classList.add('wrong');
                document.querySelector('.solution').classList.remove('hidden');
            } else {
                splash_screen();
                document.querySelector('.splash .message').innerText = "The system didn't accept your answer";
            }
        }
    }
});

let invertText = () => {
    document.querySelectorAll('.group').forEach(el => {
        if (Math.round(Math.random()) === 1 || Math.round(Math.random()) === 1)
            el.classList.toggle('invert');
    });
}

let splash_screen = (show = true) => {
    if (show) {
        document.querySelectorAll('.groups, .timer, .question, .answer, .solution').forEach(
            el => { el.classList.add('hidden'); });
        document.querySelector('.splash').classList.remove('hidden');
        document.querySelector('.splash .btn_again').classList.remove('hidden');
    } else {
        document.querySelector('.splash').classList.add('hidden');
        document.querySelectorAll('.groups').forEach(el => { el.classList.remove('hidden'); });
    }
}

let reset = (show_splash = false) => {
    clearTimeout(timer_start);
    clearTimeout(timer_numbers);
    clearTimeout(timer_game);
    clearTimeout(timer_splash);

    audio_timer.pause();
    audio_timer.currentTime = 0;

    document.querySelectorAll('.group > div, .timer, .question, .answer, .solution').forEach(el => {
        el.classList.add('hidden');
    });
    document.querySelectorAll('.real_number').forEach(el => {
        el.innerHTML = '&nbsp;';
        el.style.fontSize = '190px';
        el.classList.remove('hidden');
    });
    document.querySelectorAll('.group .shape').forEach(el => {
        minigame.shapes.forEach(shape => {
            el.classList.remove(shape);
        });
    });
    document.querySelectorAll('.group, .group div, .group .shape, .groups').forEach(el => {
        el.classList.remove('invert');
        el.classList.forEach(cl => {
            if (/^(bg_|txt_)/.test(cl)) {
                el.classList.remove(cl);
            }
        });
    });

    document.querySelector('#answer').blur();

    document.querySelector(".progress-bar").style.width = '100%';

    document.querySelector('.answer-wrapper').classList.remove('wrong', 'right')
    document.querySelector('.solution').classList.add('hidden');
    document.querySelector('#answer').value = '';

    if (show_splash)
        splash();
    else
        start();
}

let start = () => {
    data = minigame.create();

    data.groups.forEach(function(group, i) {
        let g = document.querySelectorAll('.groups .group')[i];
        g.classList.add('bg_' + group.background_color);
        g.querySelector('.real_number').innerHTML = group.real_number;
        g.querySelector('.shape').classList.add(group.shape, 'bg_' + group.shape_color);
        g.querySelector('.text_color').classList.add('txt_' + group.text_color_bg_color);
        g.querySelector('.text_color').innerHTML = group.text_color;
        g.querySelector('.text_shape').classList.add('txt_' + group.text_shape_bg_color);
        g.querySelector('.text_shape').innerHTML = group.text_shape;
        g.querySelector('.number').classList.add('txt_' + group.number_color);
        g.querySelector('.number').innerHTML = group.impostor_number;
    });


    invertText();

    document.querySelector('.quiz1').innerHTML = data.quiz1.type.text + ' (' + data['real_numbers'][data.quiz1.pos] + ')';
    document.querySelector('.quiz2').innerHTML = data.quiz2.type.text + ' (' + data['real_numbers'][data.quiz2.pos] + ')';

    document.querySelector('.solution .real_numbers').innerHTML = data.real_numbers.join(' ');
    document.querySelector('.solution .solution_text').innerHTML = data.solution;



    timer_start = sleep(1000, function() {
        document.querySelectorAll('.real_number').forEach(el => { el.style.fontSize = '0px'; });

        timer_numbers = sleep(2000, function() {
            game_started = true;

            document.querySelectorAll('.group > div, .timer, .answer').forEach(
                el => { el.classList.remove('hidden'); });
            document.querySelectorAll('.group .real_number').forEach(el => { el.classList.add('hidden'); });

            document.querySelector('.question').classList.remove('hidden');

            audio_timer.play();

            document.querySelector('#answer').focus({ preventScroll: true });

            speed = 6;
            document.querySelector(".progress-bar").style.transitionDuration = speed + 's';
            document.querySelector(".progress-bar").style.width = '0px';
            speed *= 1000;

            timer_game = sleep(speed, function() {
                game_started = false;
                streak = 0;
                audio_timer.pause();
                if (mode === 'practice') {
                    let answer = document.querySelector('.answer-wrapper');
                    answer.classList.remove('right');
                    answer.classList.add('wrong');
                    document.querySelector('.solution').classList.remove('hidden');
                } else {
                    splash_screen();
                    document.querySelector('.splash .message').innerText = "The system didn't accept your answer";
                }
            });
        });
    });

}

let splash = () => {
    if (mode === 'practice') {
        splash_screen(false);
        document.querySelector('.answer .btn_again').classList.remove('hidden');
        start();
    } else {

        splash_screen();
        document.querySelectorAll('.btn_again').forEach(el => { el.classList.add('hidden'); });
        document.querySelector('.splash .message').innerText = 'Device booting up...';
        timer_splash = sleep(3000, function() {
            document.querySelector('.splash .message').innerText = 'Dialing...';

            timer_splash = sleep(4000, function() {
                document.querySelector('.splash .message').innerText = 'Establishing connection...';

                timer_splash = sleep(3000, function() {
                    document.querySelector('.splash .message').innerText = 'Doing some hackermans stuff...';

                    timer_splash = sleep(3000, function() {
                        document.querySelector('.splash .message').innerText = 'Access code flagged; requires human captcha input...';

                        timer_splash = sleep(3000, function() {
                            document.querySelector('.splash').classList.add('hidden');
                            document.querySelector('.groups').classList.remove('hidden');
                            start();
                        });
                    });
                });
            });
        });
    }
}