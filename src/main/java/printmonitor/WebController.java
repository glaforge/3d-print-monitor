package printmonitor;

import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

@Controller("/")
public class WebController {
    @Get("kill")
    public void killSwitch() {
        System.out.println("Kill switch activated");
        System.exit(0);
    }
}
