import { Component} from 'react';
import './Loader.scss';
import LoaderSVG from '../img/common/loader.svg';
import { store}  from '../store'
import { setIsLoading } from '../store/slices/rootReducer';

export default class Loader extends Component<{assetsToLoad?: Promise<typeof import("*.png")>[]}> {

    hint: string;
    dispatch: any;

    constructor (props: {assetsToLoad?: Promise<typeof import("*.png")>[]}) { // FIXME : see typing 
        super(props);
        this.hint = "This will show up when page is loading."
    }

    componentDidMount(): void {
        const imgs: HTMLImageElement[] = [];
        if(this.props?.assetsToLoad) {
            Promise.all(this.props?.assetsToLoad).then((Modules: any) => {
                const imagesPromises = Modules.map((Module: any) => {
                    return new Promise(resolve => {
                        imgs[Module.default] = new Image();
                        imgs[Module.default].addEventListener('load', () => {
                            resolve(imgs[Module.default]);
                        });
                        imgs[Module.default].src = Module.default; 
                    });
                })
                Promise.all(imagesPromises).then(() => store.dispatch(setIsLoading(false)))
            });
        }
    }

    render () {
        return <div>
            <div id="loader">
                <img src={LoaderSVG} alt='loader display' />
                <p className="hint hidden">{this.hint}</p>
            </div>
        </div>
    }
}
