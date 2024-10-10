export const setWallpaper = (url: string) => {
	document.body.style.backgroundImage = `url(${url})`;
	document.body.style.backgroundSize = 'cover';
	document.body.style.backgroundPosition = 'center';
};

export const saveWallpaperToLocalStorage = (url: string) => {
	localStorage.setItem('wallpaper', url);
	setWallpaper(url);
};

export const removeWallpaper = () => {
	localStorage.removeItem('wallpaper');
	document.body.style.backgroundImage = '';
};
