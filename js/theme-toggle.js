document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    const currentTheme = localStorage.getItem('theme');

    if (currentTheme == 'dark') {
        document.body.classList.toggle('dark-theme');
    } else if (currentTheme == 'light') {
        document.body.classList.toggle('light-theme');
    }

    toggleButton.addEventListener('click', () => {
        let theme;
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            theme = 'light';
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    });
});
