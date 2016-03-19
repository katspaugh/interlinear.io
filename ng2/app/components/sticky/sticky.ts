import {Directive, AfterViewInit, ElementRef, Renderer} from 'angular2/core';

@Directive({
    selector: '[sticky]'
})
export class Sticky implements AfterViewInit {
    constructor(private el: ElementRef, private renderer: Renderer) {}

    private css(prop, val) {
        var el = this.el.nativeElement;
        this.renderer.setElementStyle(el, prop, val);
    }

    ngAfterViewInit() {
        var el = this.el.nativeElement;
        var box = el.getBoundingClientRect();
        var boxTop = box.top;
        var boxLeft = box.left;

        var getScroll = () => {
            return document.documentElement.scrollTop || document.body.scrollTop;
        };

        var toggleFixed = (toggle) => {
            this.css('width', toggle ? el.offsetWidth + 'px' : '');
            this.css('position', toggle ? 'fixed' : '');
            this.css('left', toggle ? boxLeft + 'px' : '');
            this.css('top', toggle ? 0 : '');
        };

        window.addEventListener('scroll', () => {
            toggleFixed(getScroll() > boxTop);
        });

        window.addEventListener('resize', () => {
            toggleFixed(false);
            boxLeft = el.getBoundingClientRect().left;
            toggleFixed(getScroll() > boxTop);
        });
    }
}
