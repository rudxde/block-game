export function migrateStore() {
    const oldHighScore = localStorage.getItem('highScore');
    const oldGameStore = localStorage.getItem('store');
    if (!oldHighScore || !oldGameStore) {
        return;
    }
    localStorage.setItem('default_highScore', oldHighScore);
    localStorage.setItem('default_store', oldGameStore);
    localStorage.removeItem('highScore');
    localStorage.removeItem('store');
}
