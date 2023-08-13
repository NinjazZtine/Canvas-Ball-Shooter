class GestureControl {
    constructor() {
        this.isActive = false;
        this.touchStartPositionX = 0;
        this.touchStartPositionY = 0;
        this.touchEndPositionX = 0;
        this.touchEndPositionY = 0;
        this.relativeX = 0;
        this.relativeY = 0;
        this.touchDistance = 0;
        this.angle = 0;
        this.power = 0;
        this.isActive = false;
    }

    updateValues() {
        this.touchDistance = Math.hypot(
            this.touchStartPositionX - this.touchEndPositionX,
            this.touchStartPositionY - this.touchEndPositionY
        );
        this.angle = Math.atan2(
            this.touchEndPositionY - this.touchStartPositionY,
            this.touchEndPositionX - this.touchStartPositionX
        );
        if (this.touchDistance > 75) {
            this.touchEndPositionX =
                75 * Math.cos(this.angle) + this.touchStartPositionX;
            this.touchEndPositionY =
                75 * Math.sin(this.angle) + this.touchStartPositionY;
            this.touchDistance = 75;
        }
        this.relativeX = this.touchEndPositionX - this.touchStartPositionX;
        this.relativeY = this.touchEndPositionY - this.touchStartPositionY;
        this.power = this.touchDistance / 75;
    }

    touchStart(x, y) {
        this.touchStartPositionX = x;
        this.touchStartPositionY = y;
        this.touchEndPositionX = x;
        this.touchEndPositionY = y;
        this.isActive = true;
    }

    touchMove(x, y) {
        this.touchEndPositionX = x;
        this.touchEndPositionY = y;
        this.updateValues();
    }

    touchEnd() {
        this.touchEndPositionX = 0;
        this.touchEndPositionY = 0;
        this.touchStartPositionX = 0;
        this.touchStartPositionY = 0;
        this.touchDistance = 0;
        this.power = 0;
        this.isActive = false;
    }
}
