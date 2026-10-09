import Rc2Home from "@/app/rc2-preview/page";
import {CoontoVideos} from "@/components/coonto-videos";
import {COONTO_VERSION} from "@/lib/version";
export const dynamic = "force-dynamic";
export default function Home(){return <><Rc2Home/><CoontoVideos/><footer style={{padding:16,textAlign:"center",fontSize:12}}>Coonto v{COONTO_VERSION}</footer></>}
