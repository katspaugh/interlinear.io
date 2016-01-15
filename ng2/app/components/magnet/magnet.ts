import {Directive, AfterViewInit, ElementRef, Renderer, Input} from 'angular2/core';

@Directive({
    selector: '[magnet]'
})
export class Magnet implements AfterViewInit {
    @Input('magnet') magnetSelector: string;

    constructor(private el: ElementRef, private renderer: Renderer) {}

    private css(prop, val) {
        this.renderer.setElementStyle(this.el, prop, val);
    }

    ngAfterViewInit() {
        let otherEl = document.querySelector(this.magnetSelector);
        if (!otherEl) return;

        var otherPos = otherEl.getBoundingClientRect();
        var thisPos = this.el.nativeElement.getBoundingClientRect();

        var x = Math.round(otherPos.left - thisPos.left);
        var y = Math.round(otherPos.top - thisPos.top);

        this.css('transform', 'translateX(' + x + 'px) translateY(' + y + 'px)');
        this.css('opacity', '0.1');

        setTimeout(() => {
            this.css('transition', 'transform 300ms ease-out, opacity 300ms ease-out');
            this.css('transform', 'translateX(0) translateY(0)');
            this.css('opacity', '1');
        }, 0);
    }
}
